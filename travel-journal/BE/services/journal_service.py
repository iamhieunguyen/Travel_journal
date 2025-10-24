# services/journal_service.py
import os
import logging
from typing import Dict, Any, Optional, List, Tuple

import boto3
from botocore.exceptions import ClientError, ParamValidationError
from boto3.dynamodb.conditions import Key
import base64, json

from decimal import Decimal

from models.journal import Journal, now_iso
from utils.geo import (
    geohash_fields,
    bbox_to_prefixes,
    in_bbox,
)

logger = logging.getLogger(__name__)


class JournalService:
    def __init__(self):
        self.table_name = os.getenv("JOURNAL_TABLE", "Journal")
        is_offline = os.getenv("IS_OFFLINE", "false").lower() == "true"

        if is_offline:
            # Trên Windows cần region + dummy creds
            self.dynamodb = boto3.resource(
                "dynamodb",
                endpoint_url=os.getenv("DDB_ENDPOINT", "http://localhost:8000"),
                region_name=os.getenv("AWS_REGION", "us-east-1"),
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "dummy"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "dummy"),
            )
        else:
            self.dynamodb = boto3.resource("dynamodb")

        self.table = self.dynamodb.Table(self.table_name)

    # CREATE
    def create(self, user_id: str, payload: Dict[str, Any]) -> Journal:
        title = (payload.get("title") or "").strip()
        content = (payload.get("content") or "").strip()
        if not title or not content:
            raise ValueError("title and content are required")

        location = payload.get("location") or {}
        if "lat" not in location or "lng" not in location:
            raise ValueError("location.lat and location.lng are required")

        j = Journal.new(
            user_id=user_id,
            title=title,
            content=content,
            location=location,
            photos=payload.get("photos") or [],       # giữ nguyên schema hiện tại
            started_at=payload.get("started_at"),
            ended_at=payload.get("ended_at"),
            visibility=(payload.get("visibility") or "private"),
        )

        # chuyển sang dict để có thể chèn thêm geo fields
        item = j.to_dict()
        logger.info("Item location before geohash: %s", item["location"])

        # Thêm geohash / geohash_prefix (QUAN TRỌNG CHO BBOX)
        try:
            item.update(geohash_fields(item["location"]))
        except Exception as e:
            raise ValueError(f"invalid location: {e}")

        # (Tuỳ chọn) field thừa cũ, nếu bạn không dùng ở nơi khác nên bỏ:
        # item["entryId"] = item["journalId"]
         
        
        db_item = self._to_dynamo(item)  
        try:
            self.table.put_item(
                Item= db_item,  # <-- dùng item đã bổ sung geo fields
                ConditionExpression="attribute_not_exists(journalId)"
            )
        except ClientError as e:
            msg = e.response.get("Error", {}).get("Message", str(e))
            raise ValueError(f"DynamoDB error: {msg}")

        # trả về Journal từ item vừa ghi (đã có geo fields)
        return Journal.from_dict(item)

    # READ
    def get(self, journal_id: str) -> Optional[Journal]:
        resp = self.table.get_item(Key={"journalId": journal_id})
        item = resp.get("Item")
        if not item:
            return None
        item = self._from_dynamo(item)  # chuyển Decimal -> float/int
        return Journal.from_dict(item) if item else None

    # UPDATE (owner-only)
    def update(self, journal_id: str, owner_user_id: str, updates: Dict[str, Any]) -> Journal:
        allowed = {"title", "content", "location", "photos", "started_at", "ended_at", "visibility"}

        names: Dict[str, str] = {}
        values: Dict[str, Any] = {}
        sets: List[str] = []

        # Gắn các field cho phép
        for k, v in updates.items():
            if k in allowed:
                names[f"#_{k}"] = k
                values[f":{k}"] = v
                sets.append(f"#_{k} = :{k}")

        # Nếu có cập nhật location => tính lại geohash / geohash_prefix
        if "location" in updates and isinstance(updates["location"], dict):
            loc = updates["location"]
            if "lat" not in loc or "lng" not in loc:
                raise ValueError("location.lat and location.lng are required when updating location")
            try:
                geo = geohash_fields(loc)
            except Exception as e:
                raise ValueError(f"invalid location: {e}")

            # chèn 2 field geo vào update expression
            for gk, gv in geo.items():
                names[f"#_{gk}"] = gk
                values[f":{gk}"] = gv
                sets.append(f"#_{gk} = :{gk}")

        # luôn cập nhật updated_at
        names["#_updated_at"] = "updated_at"
        values[":updated_at"] = now_iso()
        sets.append("#_updated_at = :updated_at")

        if not sets:
            current = self.get(journal_id)
            if not current:
                raise ValueError("Not found")
            return current

        try:
            values_dynamo = self._to_dynamo(values)  # chuyển float -> Decimal


            kwargs = {
                "Key": {"journalId": journal_id},
                "UpdateExpression": "SET " + ", ".join(sets),
                "ExpressionAttributeValues": {**values_dynamo, ":owner": owner_user_id},
                "ConditionExpression": "attribute_exists(journalId) AND userId = :owner",
                "ReturnValues": "ALL_NEW",
            }
            if names:
                kwargs["ExpressionAttributeNames"] = names

            resp = self.table.update_item(**kwargs)
            updated = resp.get("Attributes") or self.table.get_item(Key={"journalId": journal_id}).get("Item") 
            updated = self._from_dynamo(updated)  # chuyển Decimal -> float/int
            return Journal.from_dict(updated)  # type: ignore

        except ClientError as e:
            code = e.response.get("Error", {}).get("Code")
            if code == "ConditionalCheckFailedException":
                raise PermissionError("Forbidden or not found")
            logger.exception("DynamoDB ClientError on update")
            raise ValueError(f"DynamoDB error: {e.response.get('Error', {}).get('Message')}")

        except ParamValidationError as e:
            logger.exception("ParamValidationError on update")
            raise ValueError(f"Param validation error: {e}")

    # DELETE (owner-only)
    def delete(self, journal_id: str, owner_user_id: str) -> None:
        try:
            self.table.delete_item(
                Key={"journalId": journal_id},
                ConditionExpression="attribute_exists(journalId) AND userId = :owner",
                ExpressionAttributeValues={":owner": owner_user_id},
            )
        except ClientError as e:
            code = e.response.get("Error", {}).get("Code")
            if code == "ConditionalCheckFailedException":
                raise PermissionError("Forbidden or not found")
            raise

    # LIST theo viewport (bbox) cho trang Map
    def list_by_bbox(
        self,
        bbox: Tuple[float, float, float, float],  # (minLng, minLat, maxLng, maxLat)
        q: Optional[str] = None,
        limit: int = 100,
        last_key: Optional[Dict[str, Any]] = None, 
    ) -> Tuple[List[Dict[str, Any]], Optional[Dict[str, Any]]]:

        prefixes = bbox_to_prefixes(bbox, precision=5)
        if not prefixes:
            return [], None

        # last_key định nghĩa: {"p": index prefix hiện tại, "k": LastEvaluatedKey của DDB}
        start_pi = int(last_key.get("p", 0)) if last_key else 0
        lek = last_key.get("k") if last_key else None

        items: List[Dict[str, Any]] = []
        qnorm = (q or "").strip().lower()

        # để lọc sau query, overfetch nhẹ để bù lọc bbox/q
        def _overfetch(n: int) -> int:
            return min(200, max(20, n * 3))

        for pi in range(start_pi, len(prefixes)):
            pfx = prefixes[pi]
            exclusive_key = lek if pi == start_pi else None  # chỉ áp dụng lek cho prefix đầu tiên

            while True:
                query_kwargs = {
                    "IndexName": "geohash_prefix-index",
                    "KeyConditionExpression": Key("geohash_prefix").eq(pfx),
                    "ProjectionExpression": "#jid, #title, #loc, photos, geohash_prefix",
                    "ExpressionAttributeNames": {
                        "#jid": "journalId",
                        "#title": "title",
                        "#loc": "location",
                    },
                    "Limit": _overfetch(limit - len(items)),
                }
                if exclusive_key is not None:
                   query_kwargs["ExclusiveStartKey"] = exclusive_key

                resp = self.table.query(**query_kwargs)
                batch = resp.get("Items", [])
                exclusive_key = resp.get("LastEvaluatedKey")

                # lọc chính xác theo bbox + q, de-dup
                seen = set(x["journalId"] for x in items)
                for it in batch:
                    jid = it.get("journalId")
                    if not jid or jid in seen:
                        continue

                    loc = it.get("location") or {}
                    try:
                        lat = float(loc.get("lat")); lng = float(loc.get("lng"))
                    except (TypeError, ValueError):
                        continue

                    # dùng helper hiện có
                    if not in_bbox(lat, lng, bbox):
                        continue

                    if qnorm:
                        hay = " ".join([
                            (it.get("title") or ""),
                            # (tuỳ) có thể ghép content hoặc location.name nếu muốn lọc sâu hơn
                            (loc.get("name") or "") if isinstance(loc, dict) else ""
                        ]).lower()
                        if qnorm not in hay:
                            continue

                    items.append(it)
                    seen.add(jid)

                    if len(items) >= limit:
                        # còn trang? => trả next_key tương ứng
                        next_key = {"p": pi, "k": exclusive_key} if exclusive_key else (
                            {"p": pi + 1} if (pi + 1) < len(prefixes) else None
                        )
                        return [self._from_dynamo(x) for x in items], next_key

                if not exclusive_key:
                    break  # hết trang cho prefix này, chuyển prefix tiếp theo

        # hết tất cả prefix
        return [self._from_dynamo(x) for x in items], None
    
# Helper functions to convert float <-> Decimal for DynamoDB
 
    def _to_dynamo(self, v):
            """Đổi float -> Decimal (đệ quy) trước khi put/update vào DDB."""
            if isinstance(v, float):
                return Decimal(str(v))          # dùng str để giữ chính xác
            if isinstance(v, dict):
                return {k: self._to_dynamo(x) for k, x in v.items()}
            if isinstance(v, list):
                return [self._to_dynamo(x) for x in v]
            return v

    def _from_dynamo(self,v):
            """Đổi Decimal -> float/int (đệ quy) để trả JSON an toàn."""
            if isinstance(v, Decimal):
                return float(v) if v % 1 else int(v)
            if isinstance(v, dict):
                return {k: self._from_dynamo(x) for k, x in v.items()}
            if isinstance(v, list):
                return [self._from_dynamo(x) for x in v]
            return v
# Helper function for list_by_bbox
def _encode_key(obj: dict) -> str:
    return base64.urlsafe_b64encode(json.dumps(obj).encode("utf-8")).decode("utf-8")

def _decode_key(s: str) -> dict:
    return json.loads(base64.urlsafe_b64decode(s.encode("utf-8")).decode("utf-8"))