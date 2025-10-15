from dataclasses import dataclass
from typing import Optional

@dataclass
class Entry:
    entryId: str
    userId: str
    title: str
    content: str
    location: Optional[dict] = None
    photoUrl: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            entryId=data.get("entryId"),
            userId=data.get("userId"),
            title=data.get("title"),
            content=data.get("content"),
            location=data.get("location"),
            photoUrl=data.get("photoUrl")
        )

    def to_dict(self):
        return {
            "entryId": self.entryId,
            "userId": self.userId,
            "title": self.title,
            "content": self.content,
            "location": self.location,
            "photoUrl": self.photoUrl
        }