from flask import Blueprint, jsonify, request
import uuid
from models.entry import Entry
from services.entry_service import EntryService

entry_routes = Blueprint('entry_routes', __name__)
entry_service = EntryService()

@entry_routes.route("/entries", methods=["POST"])
def create_entry():
    """Create a new entry"""
    data = request.get_json()
    entry = Entry(
        entryId=str(uuid.uuid4()),
        userId=data.get("userId"),
        title=data.get("title"),
        content=data.get("content"),
        location=data.get("location"),
        photoUrl=data.get("photoUrl")
    )
    
    entry_id = entry_service.create_entry(entry)
    return jsonify({"message": "Entry created", "entryId": entry_id}), 201

@entry_routes.route("/entries/<string:entry_id>", methods=["GET"])
def get_entry(entry_id):
    """Get a specific entry by ID"""
    entry = entry_service.get_entry(entry_id)
    if not entry:
        return jsonify({"error": "Entry not found"}), 404
    return jsonify(entry.to_dict())

@entry_routes.route("/entries/user/<string:user_id>", methods=["GET"])
def get_entries_by_user(user_id):
    """Get all entries for a specific user"""
    entries = entry_service.get_entries_by_user(user_id)
    return jsonify([entry.to_dict() for entry in entries])

@entry_routes.route("/entries/<string:entry_id>", methods=["PUT"])
def update_entry(entry_id):
    """Update an existing entry"""
    data = request.get_json()
    entry = Entry(
        entryId=entry_id,
        userId=data.get("userId"),
        title=data.get("title"),
        content=data.get("content"),
        location=data.get("location"),
        photoUrl=data.get("photoUrl")
    )
    
    success = entry_service.update_entry(entry)
    if not success:
        return jsonify({"error": "Failed to update entry"}), 500
    return jsonify({"message": "Entry updated"})

@entry_routes.route("/entries/<string:entry_id>", methods=["DELETE"])
def delete_entry(entry_id):
    """Delete an entry"""
    success = entry_service.delete_entry(entry_id)
    if not success:
        return jsonify({"error": "Failed to delete entry"}), 500
    return jsonify({"message": "Entry deleted"})