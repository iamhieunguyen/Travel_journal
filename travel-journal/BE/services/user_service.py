import os
import boto3
from models.user import User
from boto3.dynamodb.conditions import Attr
import uuid
from datetime import datetime

class UserService:
    def __init__(self):
        if os.getenv("IS_OFFLINE", "true") == "true":
            dynamodb = boto3.resource("dynamodb", region_name="us-east-1", endpoint_url="http://localhost:8000")
        else:
            dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        
        self.users_table = dynamodb.Table(os.getenv("USERS_TABLE", "Users"))

    def create_user(self, username: str, email: str, password_hash: str) -> User:
        """Create a new user"""
        user = User(
            userId=str(uuid.uuid4()),
            username=username,
            email=email,
            password_hash=password_hash
        )
        
        self.users_table.put_item(Item=user.to_dict())
        return user

    def get_user(self, user_id: str) -> User:
        """Get user by ID"""
        result = self.users_table.get_item(Key={"userId": user_id})
        item = result.get("Item")
        if not item:
            return None
        return User.from_dict(item)

    def get_user_by_email(self, email: str) -> User:
        """Get user by email"""
        result = self.users_table.scan(
            FilterExpression=Attr('email').eq(email)
        )
        items = result.get("Items", [])
        if not items:
            return None
        return User.from_dict(items[0])

    def update_user(self, user: User) -> bool:
        """Update user information"""
        user.updated_at = datetime.utcnow().isoformat()
        try:
            self.users_table.put_item(Item=user.to_dict())
            return True
        except Exception:
            return False

    def delete_user(self, user_id: str) -> bool:
        """Delete a user"""
        try:
            self.users_table.delete_item(Key={"userId": user_id})
            return True
        except Exception:
            return False

    def list_users(self) -> list[User]:
        """List all users"""
        result = self.users_table.scan()
        items = result.get("Items", [])
        return [User.from_dict(item) for item in items]