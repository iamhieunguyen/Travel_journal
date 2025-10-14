from app import app
import serverless_wsgi

def handler(event, context):
    # serverless-wsgi v3.x sử dụng handle_request thay vì handle
    return serverless_wsgi.handle_request(app, event, context)
