from flask import Flask
from routes.entry_routes import entry_routes
from routes.user_routes import user_routes
from routes.auth_routes import auth_routes

app = Flask(__name__)

# Register blueprints
app.register_blueprint(entry_routes)
app.register_blueprint(user_routes)
app.register_blueprint(auth_routes)

if __name__ == "__main__":
    app.run(debug=True)
