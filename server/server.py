from flask import Flask, send_from_directory
from flask_socketio import SocketIO, emit, join_room
import os

# === Flask App Setup ===
app = Flask(__name__, static_folder="../")
socketio = SocketIO(app, cors_allowed_origins="*")

# === Serve Frontend Files ===
@app.route("/")
def index():
    # Serve index.html from parent directory
    return send_from_directory("../", "index.html")

@app.route("/<path:path>")
def serve_static(path):
    # Serve JS, CSS, and other static files from parent directory
    return send_from_directory("../", path)

# === WebRTC Signaling Events ===
@socketio.on("join")
def on_join(room):
    join_room(room)
    print(f"👥 User joined room: {room}")
    emit("ready", room=room, include_self=False)

@socketio.on("offer")
def on_offer(data):
    print("📡 Received offer, forwarding to peer...")
    emit("offer", data["description"], room=data["room"], include_self=False)

@socketio.on("answer")
def on_answer(data):
    print("📡 Received answer, forwarding to peer...")
    emit("answer", data["description"], room=data["room"], include_self=False)

@socketio.on("candidate")
def on_candidate(data):
    print("🌐 Received ICE candidate, forwarding...")
    emit("candidate", data["candidate"], room=data["room"], include_self=False)

# === Run Server ===
if __name__ == "__main__":
    print("🚀 Starting Flask-SocketIO server on http://localhost:3000")
    socketio.run(app, host="0.0.0.0", port=3000, debug=True, use_reloader=False)
