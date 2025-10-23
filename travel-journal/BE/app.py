from flask import Flask
from routes.user_routes import user_routes
from routes.auth_routes import auth_routes
from routes.journal_routes import bp as journal_routes
from flask import request, jsonify


app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False  # Đảm bảo JSON trả về không bị mã hóa ASCII


# Register blueprints
app.register_blueprint(journal_routes)
app.register_blueprint(user_routes)
app.register_blueprint(auth_routes)

if __name__ == "__main__":
    app.run(debug=True)
# Đảm bảo header có charset=utf-8
@app.after_request
def force_utf8(resp):
    ct = resp.headers.get("Content-Type")
    if ct and "charset=" not in ct:
        resp.headers["Content-Type"] = f"{ct}; charset=utf-8"
    return resp

@app.route("/_echo", methods=["POST"])
def _echo():
    raw = request.get_data()
    def _try(enc):
        try:
            return {"enc": enc, "ok": True, "text": raw.decode(enc)}
        except Exception:
            return {"enc": enc, "ok": False}
    return jsonify({
        "raw_hex_head": raw[:64].hex(),
        "try": [_try(e) for e in ["utf-8", "utf-8-sig", "cp1258", "cp1252", "latin-1"]]
    })