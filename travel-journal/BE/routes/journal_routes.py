# routes/journal_routes.py
from flask import Blueprint, request, jsonify, g
from services.journal_service import JournalService

try:
    # Nếu bạn đã có sẵn decorator auth
    from utils.auth_decorators import login_required  # đổi import cho khớp dự án bạn
except Exception:
    # fallback: cho phép chạy tạm khi dev (KHÔNG dùng ở prod)
    def login_required(f):
        def _wrap(*args, **kwargs):
            g.current_user = {"userId": "dev-user-123"}
            return f(*args, **kwargs)
        _wrap.__name__ = f.__name__
        return _wrap

bp = Blueprint("journal_routes", __name__, url_prefix="/journals")
svc = JournalService()

def _owner_required(user_id: str):
    return g.current_user and g.current_user.get("userId") == user_id

# Tạo chuyến đi theo userId rõ ràng
@bp.route("/users/<user_id>", methods=["POST"])
@login_required
def create_journal(user_id):
    if not _owner_required(user_id):
        return jsonify({"error": "Forbidden"}), 403

    try:
        payload = request.get_json(force=True, silent=False) or {}
        j = svc.create(user_id, payload)
        return jsonify(j.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # Log thực tế bạn có thể dùng logger thay vì trả lỗi chi tiết
        return jsonify({"error": "Internal Server Error"}), 500

# (Tuỳ chọn) Endpoint ngắn gọn dùng "me", không cần truyền userId
@bp.route("/me", methods=["POST"])
@login_required
def create_my_journal():
    user_id = g.current_user["userId"]
    try:
        payload = request.get_json(force=True, silent=False) or {}
        j = svc.create(user_id, payload)
        return jsonify(j.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Internal Server Error"}), 500
    
    # --- GET /journals/{journalId} (respect visibility) ---
@bp.route("/<journal_id>", methods=["GET"])
@login_required  # Nếu muốn public xem bài public KHÔNG cần login, có ghi chú ở dưới
def get_journal(journal_id):
    j = svc.get(journal_id)
    if not j:
        return jsonify({"error": "Not found"}), 404

    # Nếu không phải public -> chỉ owner xem được
    if j.visibility != "public" and not _owner_required(j.userId):
        return jsonify({"error": "Forbidden"}), 403

    return jsonify(j.to_dict()), 200

# --- PATCH /journals/{journalId} (owner-only) ---
@bp.route("/<journal_id>", methods=["PATCH"])
@login_required
def update_journal(journal_id):
    user = getattr(g, "current_user", None)
    if not user or not user.get("userId"):
        return jsonify({"error": "Unauthorized"}), 401

    payload = request.get_json(force=True) or {}
    try:
        updated = svc.update(journal_id, user["userId"], payload)
    except PermissionError:
        # Không phải owner hoặc record không tồn tại
        # (trả 403 thay vì 404 để rõ ý quyền; hoặc bạn có thể trả 404 để tránh leak)
        return jsonify({"error": "Forbidden"}), 403
    except ValueError as e:  # "Not found"
        return jsonify({"error": str(e)}), 404
    except Exception:
        import logging; logging.getLogger(__name__).exception("Unhandled update error")
        return jsonify({"error": "Internal Server Error"}), 500

    return jsonify(updated.to_dict()), 200

# --- DELETE /journals/{journalId} (owner-only) ---
@bp.route("/<journal_id>", methods=["DELETE"])
@login_required
def delete_journal(journal_id):
    user = getattr(g, "current_user", None)
    if not user or not user.get("userId"):
        return jsonify({"error": "Unauthorized"}), 401

    try:
        svc.delete(journal_id, user["userId"])
    except PermissionError:
        return jsonify({"error": "Forbidden"}), 403
    except Exception:
        return jsonify({"error": "Internal Server Error"}), 500

    return jsonify({"deleted": True, "journalId": journal_id}), 200
