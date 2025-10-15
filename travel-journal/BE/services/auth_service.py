import jwt
from datetime import datetime, timedelta
from models.user import User
from services.user_service import UserService

class AuthService:
    def __init__(self):
        self.user_service = UserService()
        self.secret_key = "dev-secret"  # Hardcode cho môi trường dev

    def register(self, username: str, email: str, password: str) -> tuple[User, str]:
        """Register a new user and return user with JWT token"""
        # Check if user exists
        existing_user = self.user_service.get_user_by_email(email)
        if existing_user:
            raise ValueError("User with this email already exists")

        # Trong local dev, lưu password dưới dạng plain text
        user = self.user_service.create_user(username, email, password)
        
        # Generate token
        token = self._generate_token(user)

        return user, token

    def login(self, email: str, password: str) -> tuple[User, str]:
        """Login user and return JWT token"""
        user = self.user_service.get_user_by_email(email)
        # Trong local dev, so sánh password trực tiếp
        if not user or user.password_hash != password:
            raise ValueError("Invalid email or password")

        token = self._generate_token(user)
        return user, token

    def validate_token(self, token: str) -> User:
        """Validate JWT token and return user"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            user = self.user_service.get_user(payload["sub"])
            if not user:
                raise ValueError("User not found")
            return user
        except Exception:
            raise ValueError("Invalid token")

    def _generate_token(self, user: User) -> str:
        """Generate JWT token for user"""
        payload = {
            "sub": user.userId,
            # Token hết hạn sau 7 ngày
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        return jwt.encode(payload, self.secret_key, algorithm="HS256")