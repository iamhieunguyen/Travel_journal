from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class User:
    userId: str
    username: str
    email: str
    password_hash: str
    created_at: str = None
    updated_at: str = None
    profile_picture: Optional[str] = None
    
    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.utcnow().isoformat()
        if not self.updated_at:
            self.updated_at = self.created_at

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            userId=data.get("userId"),
            username=data.get("username"),
            email=data.get("email"),
            password_hash=data.get("password_hash"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
            profile_picture=data.get("profile_picture")
        )

    def to_dict(self, exclude_password: bool = False):
        data = {
            "userId": self.userId,
            "username": self.username,
            "email": self.email,
            "password_hash": self.password_hash,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "profile_picture": self.profile_picture
        }
        if exclude_password:
            data.pop("password_hash")
        return data