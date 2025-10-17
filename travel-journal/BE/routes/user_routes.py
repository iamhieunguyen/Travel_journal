from flask import Blueprint, jsonify, request
from services.user_service import UserService
from models.user import User

user_routes = Blueprint('user_routes', __name__)
user_service = UserService()

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
