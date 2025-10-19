# models/journal.py
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

ISO = "%Y-%m-%dT%H:%M:%S.%fZ"

def now_iso() -> str:
    return datetime.utcnow().strftime(ISO)

@dataclass
class Journal:
    journalId: str
    userId: str
    title: str
    content: str
    location: Optional[str] = None
    photos: List[str] = field(default_factory=list)  # URLs ảnh (để trống nếu chưa dùng S3)
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
    visibility: str = "private"  # "private" | "public"
    created_at: str = field(default_factory=now_iso)
    updated_at: str = field(default_factory=now_iso)

    @staticmethod
    def new(user_id: str, title: str, content: str, **kwargs) -> "Journal":
        return Journal(
            journalId=str(uuid.uuid4()),
            userId=user_id,
            title=title,
            content=content,
            location=kwargs.get("location"),
            photos=kwargs.get("photos", []),
            started_at=kwargs.get("started_at"),
            ended_at=kwargs.get("ended_at"),
            visibility=kwargs.get("visibility", "private"),
        )

    @staticmethod
    def from_dict(d: Dict[str, Any]) -> "Journal":
        return Journal(**d)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "journalId": self.journalId,
            "userId": self.userId,
            "title": self.title,
            "content": self.content,
            "location": self.location,
            "photos": self.photos,
            "started_at": self.started_at,
            "ended_at": self.ended_at,
            "visibility": self.visibility,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
