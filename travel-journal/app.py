import os
import json
import boto3
import uuid
from flask import Flask, jsonify, request

app = Flask(__name__)

# --- DynamoDB setup ---
IS_OFFLINE = os.environ.get('IS_OFFLINE')

if IS_OFFLINE:
    dynamodb = boto3.resource(
        'dynamodb',
        region_name='localhost',
        endpoint_url='http://localhost:8000'
    )
else:
    dynamodb = boto3.resource('dynamodb')

# --- Get table names from environment ---
USERS_TABLE = os.environ.get('USERS_TABLE', 'Users')
JOURNAL_TABLE = os.environ.get('JOURNAL_TABLE', 'Journal')

# --- Initialize tables ---
users_table = dynamodb.Table(USERS_TABLE)
journal_table = dynamodb.Table(JOURNAL_TABLE)

# --- Routes ---
@app.route('/')
def home():
    return jsonify({"message": "Welcome to Travel Journal API"})


@app.route('/users/<string:user_id>', methods=['GET'])
def get_user(user_id):
    result = users_table.get_item(Key={'userId': user_id})
    item = result.get('Item')
    if not item:
        return jsonify({'error': f'User with ID {user_id} not found'}), 404
    return jsonify(item)


@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    user_id = data.get('userId')
    name = data.get('name')

    if not user_id or not name:
        return jsonify({'error': 'Missing "userId" or "name"'}), 400

    users_table.put_item(Item={'userId': user_id, 'name': name})
    return jsonify({'userId': user_id, 'name': name}), 201


@app.route('/entries', methods=['POST'])
def create_entry():
    data = request.get_json()
    entry_id = str(uuid.uuid4())

    item = {
        'entryId': entry_id,
        'userId': data.get('userId'),
        'title': data.get('title'),
        'content': data.get('content'),
        'location': data.get('location'),
        'photoUrl': data.get('photoUrl')
    }

    journal_table.put_item(Item=item)
    return jsonify({'message': 'Entry created', 'entryId': entry_id}), 201


@app.route('/entries/<string:entry_id>', methods=['GET'])
def get_entry(entry_id):
    result = journal_table.get_item(Key={'entryId': entry_id})
    item = result.get('Item')
    if not item:
        return jsonify({'error': 'Entry not found'}), 404
    return jsonify(item)
