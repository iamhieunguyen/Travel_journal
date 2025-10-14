import boto3

def detect_labels(bucket, image):
    client = boto3.client('rekognition')
    response = client.detect_labels(
        Image={'S3Object': {'Bucket': bucket, 'Name': image}},
        MaxLabels=5
    )
    return [label['Name'] for label in response['Labels']]
