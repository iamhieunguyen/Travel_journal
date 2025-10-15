from flask import Flask, jsonify, request
import boto3
import uuid
import os
from boto3.dynamodb.conditions import Attr

app = Flask(__name__)

# DynamoDB local hoặc AWS
if os.getenv("IS_OFFLINE", "true") == "true":
    dynamodb = boto3.resource("dynamodb", region_name="us-east-1", endpoint_url="http://localhost:8000")
else:
    dynamodb = boto3.resource("dynamodb", region_name="us-east-1")

users_table = dynamodb.Table(os.getenv("USERS_TABLE", "Users"))
journal_table = dynamodb.Table(os.getenv("JOURNAL_TABLE", "Journal"))

# 🧩 POST /entries - tạo entry mới
@app.route("/entries", methods=["POST"])
def create_entry():
    data = request.get_json()
    entry_id = str(uuid.uuid4())

    item = {
        "entryId": entry_id,
        "userId": data.get("userId"),
        "title": data.get("title"),
        "content": data.get("content"),
        "location": data.get("location"),
        "photoUrl": data.get("photoUrl"),
    }

    journal_table.put_item(Item=item)
    return jsonify({"message": "Entry created", "entryId": entry_id}), 201


# 🧩 GET /entries/<entryId> - lấy 1 entry
@app.route("/entries/<string:entry_id>", methods=["GET"])
def get_entry(entry_id):
    result = journal_table.get_item(Key={"entryId": entry_id})
    item = result.get("Item")
    if not item:
        return jsonify({"error": "Entry not found"}), 404
    return jsonify(item)


# 🧩 GET /entries/user/<userId> - lấy toàn bộ entry của user
@app.route("/entries/user/<string:user_id>", methods=["GET"])
def get_entries_by_user(user_id):
    result = journal_table.scan(
        FilterExpression=Attr("userId").eq(user_id)
    )
    return jsonify(result.get("Items", []))


# 🧩 GET /entries - lấy tất cả entries
@app.route("/entries", methods=["GET"])
def get_all_entries():
    result = journal_table.scan()
    return jsonify(result.get("Items", []))


@app.route("/")
def home():
    return jsonify({"message": "Travel Journal API is running"})


if __name__ == "__main__":
    app.run(debug=True)
