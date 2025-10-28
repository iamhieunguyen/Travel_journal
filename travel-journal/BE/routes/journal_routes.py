# routes/journal_routes.py
from flask import Blueprint, request, jsonify, g
from services.journal_service import JournalService
import json
from utils.geo import parse_bbox
import logging
logger = logging.getLogger(__name__)


def login_required(f): 
        def _wrap(*args, **kwargs):
            user_id = kwargs.get('user_id')
            g.current_user = {"userId": user_id or "dev-user-123"}
            return f(*args, **kwargs) 
        _wrap.__name__ = f.__name__ 
        return _wrap
 
bp = Blueprint("journal_routes", __name__, url_prefix="/journals")
svc = JournalService()

# Helper: đọc JSON chịu nhiều encoding (UTF-8/UTF-8-SIG/cp1258/…)
def parse_json_tolerant():
    raw = request.get_data(cache=False)  # bytes as-is
    try:
        return json.loads(raw)  # bytes -> UTF-8 (mặc định)
    except Exception:
        pass
    for enc in ("utf-8-sig", "cp1258", "cp1252", "latin-1"):
        try:
            return json.loads(raw.decode(enc))
        except Exception:
            continue
    raise ValueError("Invalid JSON encoding. Gửi với Content-Type: application/json; charset=utf-8.")

# ---------- CREATE ----------
@bp.route("/users/<user_id>", methods=["POST"])
@login_required
def create_journal(user_id):
    if not (g.current_user and g.current_user.get("userId") == user_id):
        return jsonify({"error": "Forbidden"}), 403
    try:
        payload = parse_json_tolerant()  
        payload = fix_payload_texts(payload)         
        j = svc.create(user_id, payload)
        return jsonify(j.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        logger.exception("Unhandled create error")
        return jsonify({"error": "Internal Server Error"}), 500

@bp.route("/me", methods=["POST"])
@login_required
def create_my_journal():
    try:
        payload = parse_json_tolerant()
        payload = fix_payload_texts(payload)          
        j = svc.create(g.current_user["userId"], payload)
        return jsonify(j.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        logger.exception("Unhandled create error")
        return jsonify({"error": "Internal Server Error"}), 500

# ---------- GET ----------
@bp.route("/<journal_id>", methods=["GET"])
@login_required
def get_journal(journal_id):
    j = svc.get(journal_id)
    if not j:
        return jsonify({"error": "Not found"}), 404
    if j.visibility != "public" and g.current_user.get("userId") != j.userId:
        return jsonify({"error": "Forbidden"}), 403
    return jsonify(j.to_dict()), 200

# ---------- PATCH ----------
@bp.route("/<journal_id>", methods=["PATCH"])
@login_required
def update_journal(journal_id):
    try:
        payload = parse_json_tolerant()
        payload = fix_payload_texts(payload)           
        updated = svc.update(journal_id, g.current_user["userId"], payload)
        return jsonify(updated.to_dict()), 200
    except PermissionError:
        return jsonify({"error": "Forbidden"}), 403
    except ValueError as e:
        msg = str(e)
        return jsonify({"error": msg}), 404 if "Not found" in msg else 400
    except Exception:
        import logging; logging.getLogger(__name__).exception("Unhandled update error")
        return jsonify({"error": "Internal Server Error"}), 500

# ---------- DELETE ----------
@bp.route("/<journal_id>", methods=["DELETE"])
@login_required
def delete_journal(journal_id):
    try:
        svc.delete(journal_id, g.current_user["userId"])
        return jsonify({"deleted": True, "journalId": journal_id}), 200
    except PermissionError:
        return jsonify({"error": "Forbidden"}), 403
    except Exception:
        return jsonify({"error": "Internal Server Error"}), 500
    
#--input endiconding test endpoint
# ---- Stronger mojibake fixer ----
def _try_fix(s: str):
    out = []
    # Trường hợp phổ biến: UTF-8 bị decode thành latin-1/cp1252/cp1258
    for enc in ("latin-1", "cp1252", "cp1258"):
        try: out.append(s.encode(enc, errors="strict").decode("utf-8", errors="strict"))
        except Exception: pass
    # Trường hợp ngược lại (ít gặp): bị encode UTF-8 rồi decode sai
    try: out.append(s.encode("utf-8", errors="strict").decode("latin-1", errors="strict"))
    except Exception: pass
    return out

VN_CHARS = "ăâêôơưđĂÂÊÔƠƯàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵĐ"


def demojibake(s: str) -> str:
    if not isinstance(s, str):
        return s
    if any(ch in s for ch in ("Ã", "Â", "¢", "¤", "¥")):
        candidates = _try_fix(s)
        for candidate in candidates:
            if any(ch in candidate for ch in VN_CHARS):
                return candidate
        return s.encode("latin-1").decode("utf-8", errors="replace")
    return s

def fix_payload_texts(p: dict) -> dict:
    for k in ("title", "content", "location"):
        if k in p and isinstance(p[k], str):
            p[k] = demojibake(p[k])
    return p

# ---------- LIST by BBOX ----------    

@bp.route("", methods=["GET"])
def list_journals():
    # ?bbox=minLng,minLat,maxLng,maxLat&q=optional&limit=100&lastKey=base64
    bbox_str = request.args.get("bbox")
    if not bbox_str:
        return jsonify({"error": "bbox is required (minLng,minLat,maxLng,maxLat)"}), 400
    try:
        bbox = parse_bbox(bbox_str)
    except Exception as e:
        return jsonify({"error": f"bbox invalid: {e}"}), 400

    q = request.args.get("q")
    try:
        limit = max(1, min(100, int(request.args.get("limit", "100"))))
    except ValueError:
        limit = 100

    last_key_param = request.args.get("lastKey")
    last_key = None
    if last_key_param:
        try:
            last_key = _decode_key(last_key_param)
        except Exception:
            return jsonify({"error": "lastKey invalid"}), 400

    items, next_key = svc.list_by_bbox(bbox, q=q, limit=limit, last_key=last_key)

    # map gọn cho marker
    markers = [{
        "journalId": it.get("journalId"),
        "title": it.get("title") or "",
        "location": it.get("location") or {},
        "imageUrl": (it.get("imageUrls") or it.get("photos") or [None])[0]
                    if isinstance(it.get("imageUrls") or it.get("photos"), list) else None
    } for it in items]

    resp = {
        "items": markers,
        "count": len(markers),
    }
    if next_key:
        resp["lastKey"] = _encode_key(next_key)

    return jsonify(resp), 200
