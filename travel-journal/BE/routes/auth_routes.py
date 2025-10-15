from flask import Blueprint, jsonify, request
from services.auth_service import AuthService
from functools import wraps

auth_routes = Blueprint('auth_routes', __name__)
auth_service = AuthService()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "No authentication token provided"}), 401
        
        token = auth_header.split(' ')[1]
        try:
            auth_service.validate_token(token)
        except ValueError as e:
            return jsonify({"error": str(e)}), 401
            
        return f(*args, **kwargs)
    return decorated_function

@auth_routes.route("/auth/register", methods=["POST"])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ["username", "email", "password"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400
    
    try:
        user, token = auth_service.register(
            username=data["username"],
            email=data["email"],
            password=data["password"]
        )
        return jsonify({
            "message": "Registration successful",
            "token": token,
            "user": user.to_dict(exclude_password=True)
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 409

@auth_routes.route("/auth/login", methods=["POST"])
def login():
    """Login user"""
    data = request.get_json()
    
    # Validate required fields
    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400
    
    try:
        user, token = auth_service.login(
            email=data["email"],
            password=data["password"]
        )
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": user.to_dict(exclude_password=True)
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

@auth_routes.route("/auth/verify", methods=["GET"])
@login_required
def verify_token():
    """Verify JWT token"""
    return jsonify({"message": "Token is valid"})