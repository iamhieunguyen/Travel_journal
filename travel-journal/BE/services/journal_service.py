# services/journal_service.py
import os
import boto3
from botocore.exceptions import ClientError  # <-- thêm
from typing import Dict, Any, Optional
from models.journal import Journal, now_iso
import logging
logger = logging.getLogger(__name__)
from botocore.exceptions import ClientError, ParamValidationError




class JournalService:
    def __init__(self):
        self.table_name = os.getenv("JOURNAL_TABLE", "Journal")
        is_offline = os.getenv("IS_OFFLINE", "false").lower() == "true"
        if is_offline:
            # Quan trọng trên Windows: thêm region + dummy creds
            self.dynamodb = boto3.resource(
                "dynamodb",
                endpoint_url="http://localhost:8000",
                region_name="us-east-1",
                aws_access_key_id="dummy",
                aws_secret_access_key="dummy",
            )
        else:
            self.dynamodb = boto3.resource("dynamodb")
        self.table = self.dynamodb.Table(self.table_name)

    def create(self, user_id: str, payload: Dict[str, Any]) -> Journal:
        title = (payload.get("title") or "").strip()
        content = (payload.get("content") or "").strip()
        if not title or not content:
            raise ValueError("title and content are required")

        j = Journal.new(
            user_id=user_id,
            title=title,
            content=content,
            location=payload.get("location"),
            photos=payload.get("photos") or [],
            started_at=payload.get("started_at"),
            ended_at=payload.get("ended_at"),
            visibility=(payload.get("visibility") or "private"),
        )
        item = j.to_dict()
        item["entryId"] = item["journalId"] 

        try:
            self.table.put_item(
                Item=j.to_dict(),
                ConditionExpression="attribute_not_exists(journalId)"
            )
        except ClientError as e:
            # DEV ONLY: trả lỗi rõ ràng để bạn debug thay vì 500 mù
            msg = e.response.get("Error", {}).get("Message", str(e))
            raise ValueError(f"DynamoDB error: {msg}")

        return j
    
    # READ
    def get(self, journal_id: str) -> Optional[Journal]:
        resp = self.table.get_item(Key={"journalId": journal_id})
        item = resp.get("Item")
        return Journal.from_dict(item) if item else None

    # UPDATE (owner-only)
    def update(self, journal_id: str, owner_user_id: str, updates: Dict[str, Any]) -> Journal:
        allowed = {"title", "content", "location", "photos", "started_at", "ended_at", "visibility"}
        names: Dict[str, str] = {}
        values: Dict[str, Any] = {}
        sets = []

        for k, v in updates.items():
            if k in allowed:
                names[f"#_{k}"] = k
                values[f":{k}"] = v
                sets.append(f"#_{k} = :{k}")

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
            # LƯU Ý: chỉ truyền ExpressionAttributeNames khi KHÔNG rỗng
            kwargs = {
                "Key": {"journalId": journal_id},
                "UpdateExpression": "SET " + ", ".join(sets),
                "ExpressionAttributeValues": values | {":owner": owner_user_id},
                "ConditionExpression": "attribute_exists(journalId) AND userId = :owner",
                "ReturnValues": "ALL_NEW",
            }
            if names:
                kwargs["ExpressionAttributeNames"] = names

            self.table.update_item(**kwargs)

        except ClientError as e:
            code = e.response.get("Error", {}).get("Code")
            if code == "ConditionalCheckFailedException":
                # Không phải owner hoặc không tồn tại
                raise PermissionError("Forbidden or not found")
            logger.exception("DynamoDB ClientError on update")
            raise ValueError(f"DynamoDB error: {e.response.get('Error', {}).get('Message')}")

        except ParamValidationError as e:
            # Thường gặp khi truyền None, ExpressionAttributeNames rỗng, type sai...
            logger.exception("ParamValidationError on update")
            raise ValueError(f"Param validation error: {e}")
        
        updated = self.table.get_item(Key={"journalId": journal_id}).get("Item")
        return Journal.from_dict(updated) # type: ignore

    # return self.get(journal_id)  
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
                    # Không phải owner hoặc không tồn tại
                    raise PermissionError("Forbidden or not found")
                raise
