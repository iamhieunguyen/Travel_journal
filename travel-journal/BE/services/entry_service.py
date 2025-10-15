import os
import boto3
from models.entry import Entry
from boto3.dynamodb.conditions import Attr

class EntryService:
    def __init__(self):
        if os.getenv("IS_OFFLINE", "true") == "true":
            dynamodb = boto3.resource("dynamodb", region_name="us-east-1", endpoint_url="http://localhost:8000")
        else:
            dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        
        self.journal_table = dynamodb.Table(os.getenv("JOURNAL_TABLE", "Journal"))

    def create_entry(self, entry: Entry) -> str:
        """Create a new entry in the journal table"""
        self.journal_table.put_item(Item=entry.to_dict())
        return entry.entryId

    def get_entry(self, entry_id: str) -> Entry:
        """Get a specific entry by ID"""
        result = self.journal_table.get_item(Key={"entryId": entry_id})
        item = result.get("Item")
        if not item:
            return None
        return Entry.from_dict(item)

    def get_entries_by_user(self, user_id: str) -> list[Entry]:
        """Get all entries for a specific user"""
        result = self.journal_table.scan(
            FilterExpression=Attr("userId").eq(user_id)
        )
        items = result.get("Items", [])
        return [Entry.from_dict(item) for item in items]

    def update_entry(self, entry: Entry) -> bool:
        """Update an existing entry"""
        try:
            self.journal_table.put_item(Item=entry.to_dict())
            return True
        except Exception:
            return False

    def delete_entry(self, entry_id: str) -> bool:
        """Delete an entry by ID"""
        try:
            self.journal_table.delete_item(Key={"entryId": entry_id})
            return True
        except Exception:
            return False