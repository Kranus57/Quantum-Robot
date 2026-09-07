from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict

class ConnectionManager:
    """
    Real-time WebSocket Manager for Quantum Sandbox Multiplayer Collaboration.
    """
    def __init__(self):
        self.active_rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_rooms:
            self.active_rooms[session_id] = []
        self.active_rooms[session_id].append(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_rooms:
            if websocket in self.active_rooms[session_id]:
                self.active_rooms[session_id].remove(websocket)
            if not self.active_rooms[session_id]:
                del self.active_rooms[session_id]

    async def broadcast_to_room(self, session_id: str, message: dict, sender: WebSocket):
        if session_id in self.active_rooms:
            for connection in self.active_rooms[session_id]:
                if connection != sender:
                    await connection.send_json(message)

manager = ConnectionManager()
