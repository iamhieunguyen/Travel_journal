import os
import boto3
from botocore.exceptions import ClientError

# --- Khởi tạo DynamoDB client ---
dynamodb = boto3.resource('dynamodb')

# --- Lấy tên bảng từ environment variables (serverless.yml cung cấp) ---
USERS_TABLE = os.environ.get("USERS_TABLE")
JOURNAL_TABLE = os.environ.get("JOURNAL_TABLE")

users_table = dynamodb.Table(USERS_TABLE) if USERS_TABLE else None
journal_table = dynamodb.Table(JOURNAL_TABLE) if JOURNAL_TABLE else None


# --- USERS TABLE FUNCTIONS ---
def create_user(user_id, name):
    """Tạo user mới"""
    try:
        users_table.put_item(Item={"userId": user_id, "name": name})
        return {"userId": user_id, "name": name}
    except ClientError as e:
        raise Exception(f"Error creating user: {e.response['Error']['Message']}")


def get_user(user_id):
    """Lấy thông tin user theo ID"""
    try:
        response = users_table.get_item(Key={"userId": user_id})
        return response.get("Item")
    except ClientError as e:
        raise Exception(f"Error fetching user: {e.response['Error']['Message']}")


def list_users():
    """Lấy toàn bộ user"""
    try:
        response = users_table.scan()
        return response.get("Items", [])
    except ClientError as e:
        raise Exception(f"Error listing users: {e.response['Error']['Message']}")


# --- JOURNAL ENTRIES FUNCTIONS ---
def add_journal_entry(entry):
    """Thêm bài viết mới (Travel Entry)"""
    try:
        journal_table.put_item(Item=entry)
        return entry
    except ClientError as e:
        raise Exception(f"Error adding entry: {e.response['Error']['Message']}")


def get_journal_entry(entry_id):
    """Lấy bài viết theo entryId"""
    try:
        response = journal_table.get_item(Key={"entryId": entry_id})
        return response.get("Item")
    except ClientError as e:
        raise Exception(f"Error fetching entry: {e.response['Error']['Message']}")


def list_journal_entries():
    """Lấy toàn bộ bài viết"""
    try:
        response = journal_table.scan()
        return response.get("Items", [])
    except ClientError as e:
        raise Exception(f"Error scanning entries: {e.response['Error']['Message']}")


def delete_journal_entry(entry_id):
    """Xóa bài viết"""
    try:
        journal_table.delete_item(Key={"entryId": entry_id})
        return {"message": f"Deleted entry {entry_id}"}
    except ClientError as e:
        raise Exception(f"Error deleting entry: {e.response['Error']['Message']}")


def update_journal_entry(entry_id, updates):
    """Cập nhật bài viết"""
    try:
        update_expression = "SET " + ", ".join(f"#{k}=:{k}" for k in updates.keys())
        expression_attr_names = {f"#{k}": k for k in updates.keys()}
        expression_attr_values = {f":{k}": v for k, v in updates.items()}

        journal_table.update_item(
            Key={"entryId": entry_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attr_names,
            ExpressionAttributeValues=expression_attr_values
        )
        return {"message": f"Updated entry {entry_id}"}
    except ClientError as e:
        raise Exception(f"Error updating entry: {e.response['Error']['Message']}")
