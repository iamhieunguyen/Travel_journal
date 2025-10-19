from flask import Blueprint, jsonify, request
from services.user_service import UserService
from models.user import User
import os
from werkzeug.utils import secure_filename
from services.auth_service import AuthService
import logging 

logger = logging.getLogger(__name__)
user_routes = Blueprint('user_routes', __name__)
user_service = UserService()
auth_service = AuthService()

# === Cấu hình upload ===
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "..", "uploads", "avatars")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
MAX_FILE_SIZE_MB = 5
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@user_routes.route("/users", methods=["POST"])
def create_user():
    """Create a new user"""
    data = request.get_json()
    
    # Validate required fields
    if not data.get("username") or not data.get("email"):
        return jsonify({"error": "Username and email are required"}), 400
        
    # Check if user with email already exists
    existing_user = user_service.get_user_by_email(data["email"])
    if existing_user:
        return jsonify({"error": "User with this email already exists"}), 409
        
    user = user_service.create_user(
        username=data["username"],
        email=data["email"]
    )
    
    return jsonify(user.to_dict()), 201

@user_routes.route("/users/<string:user_id>", methods=["GET"])
def get_user(user_id):
    """Get user by ID"""
    user = user_service.get_user(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict())

@user_routes.route("/users/<string:user_id>", methods=["PUT"])
def update_user(user_id):
    """Update user information"""
    data = request.get_json()
    
    # Get existing user
    user = user_service.get_user(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Update fields
    if "username" in data:
        user.username = data["username"]
    if "email" in data:
        user.email = data["email"]
    if "profile_picture" in data:
        user.profile_picture = data["profile_picture"]
        
    success = user_service.update_user(user)
    if not success:
        return jsonify({"error": "Failed to update user"}), 500
        
    return jsonify(user.to_dict())

@user_routes.route("/users/<string:user_id>", methods=["DELETE"])
def delete_user(user_id):
    """Delete a user"""
    success = user_service.delete_user(user_id)
    if not success:
        return jsonify({"error": "Failed to delete user"}), 500
    return jsonify({"message": "User deleted successfully"})

@user_routes.route("/users", methods=["GET"])
def list_users():
    """List all users"""
    users = user_service.list_users()
    return jsonify([user.to_dict() for user in users])

# New route to get current user's profile
@user_routes.route("/users/me", methods=["GET"])
def get_my_profile():
    """
    Get the current user's profile.
    Requires Authorization header: Bearer <JWT token>
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header:
        return jsonify({"error": "Authorization header is required"}), 401

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Invalid token format"}), 401
            
    token = auth_header.split(" ")[1]
    
    try:
        from services.auth_service import AuthService
        auth_service = AuthService()
        
        # Dùng AuthService để validate token và lấy user
        user = auth_service.validate_token(token)
        
        # Trả về thông tin người dùng (ẩn mật khẩu)
        return jsonify(user.to_dict(exclude_password=True)), 200
            
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    
    logger = logging.getLogger(__name__)

def allowed_file(filename):
    """Check file extension hợp lệ"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_size(file):
    file.seek(0, os.SEEK_END)
    size_mb = file.tell() / (1024 * 1024)
    file.seek(0)
    return size_mb


# === Upload avatar an toàn ===
@user_routes.route("/users/<string:user_id>/avatar", methods=["POST"])
def upload_avatar(user_id):
    """
    Upload avatar (safe, validated, with rollback & logging)
    """
    try:
        # ✅ 1. Xác thực người dùng
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        token = auth_header.split(" ")[1]
        requester = auth_service.validate_token(token)

        if requester.userId != user_id:
            return jsonify({"error": "Permission denied"}), 403

        # ✅ 2. Kiểm tra file upload
        if "avatar" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["avatar"]
        if file.filename == "" or not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        if get_file_size(file) > MAX_FILE_SIZE_MB:
            return jsonify({"error": "File too large (max 5MB)"}), 400

        # ✅ 3. Kiểm tra người dùng tồn tại
        user = user_service.get_user(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # ✅ 4. Lưu file tạm & xóa ảnh cũ nếu có
        filename = secure_filename(f"{user_id}_{file.filename}")
        abs_path = os.path.abspath(os.path.join(UPLOAD_FOLDER, filename))

        # Tránh path traversal
        if not abs_path.startswith(os.path.abspath(UPLOAD_FOLDER)):
            return jsonify({"error": "Invalid file path"}), 400

        old_path = os.path.abspath(user.profile_picture.strip("/")) if user.profile_picture else None

        try:
            file.save(abs_path)
        except Exception as e:
            logger.error(f"File save failed: {e}")
            return jsonify({"error": "Failed to save file"}), 500

        # ✅ 5. Cập nhật DB
        user.profile_picture = f"/uploads/avatars/{filename}"
        if not user_service.update_user(user):
            # Rollback file nếu DB update fail
            if os.path.exists(abs_path):
                os.remove(abs_path)
            return jsonify({"error": "Failed to update user record"}), 500

        # ✅ 6. Xóa file cũ (sau khi DB thành công)
        if old_path and os.path.exists(old_path):
            try:
                os.remove(old_path)
            except Exception as e:
                logger.warning(f"Failed to delete old avatar: {e}")

        logger.info(f"User {user_id} uploaded new avatar: {filename}")
        return jsonify({
            "message": "Avatar uploaded successfully",
            "avatar_url": user.profile_picture
        }), 200

    except Exception as e:
        logger.error(f"Unexpected error in upload_avatar: {e}")
        return jsonify({"error": "Internal server error"}), 500
