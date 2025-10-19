from flask import Flask
from routes.user_routes import user_routes
from routes.auth_routes import auth_routes
from routes.journal_routes import bp as journal_routes

app = Flask(__name__)

# Register blueprints
app.register_blueprint(journal_routes)
app.register_blueprint(user_routes)
app.register_blueprint(auth_routes)

if __name__ == "__main__":
    app.run(debug=True)
