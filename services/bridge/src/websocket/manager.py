"""
WebSocket Connection Manager for real-time collaboration.

Handles multi-session WebSocket connections, broadcasting,
and user presence tracking.
"""

from fastapi import WebSocket
from typing import Set, Dict
import json


class ConnectionManager:
    def __init__(self):
        # session_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # WebSocket -> session_id mapping
        self.connection_map: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)
        self.connection_map[websocket] = session_id

        # Notify others
        await self.broadcast(
            session_id,
            {
                "type": "user_joined",
                "userId": f"user_{id(websocket)}",
                "userCount": len(self.active_connections[session_id]),
            },
            exclude=websocket,
        )

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
        self.connection_map.pop(websocket, None)

    async def broadcast(
        self,
        session_id: str,
        message: dict,
        exclude: WebSocket | None = None,
    ):
        if session_id not in self.active_connections:
            return

        dead_connections = set()
        for connection in self.active_connections[session_id]:
            if connection == exclude:
                continue
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                dead_connections.add(connection)

        # Cleanup dead connections
        for dead in dead_connections:
            self.disconnect(dead, session_id)
