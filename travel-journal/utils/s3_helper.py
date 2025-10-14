import boto3
import os

def upload_photo(file_name, bucket_name, object_name=None):
    s3 = boto3.client('s3')
    if object_name is None:
        object_name = file_name
    s3.upload_file(file_name, bucket_name, object_name)
    return f"https://{bucket_name}.s3.amazonaws.com/{object_name}"