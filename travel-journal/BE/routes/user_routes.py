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