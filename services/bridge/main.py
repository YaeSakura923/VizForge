"""
VizForge Bridge — FastAPI Backend

提供以下服务:
- 数据格式转换 (VTK ↔ GLTF ↔ OBJ ↔ STL)
- WASM 编译服务
- WebSocket 实时协作
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import uuid
from src.websocket.manager import ConnectionManager
from src.converters.format_converter import FormatConverter

app = FastAPI(
    title="VizForge Bridge API",
    description="Backend services for VTK.js Visualization Pipeline Engine",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ConnectionManager()
converter = FormatConverter()


# ===== Health =====

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "vizforge-bridge",
        "version": "1.0.0",
    }


# ===== File Conversion =====

@app.post("/api/convert")
async def convert_file(
    file: UploadFile = File(...),
    target_format: str = "gltf",
):
    """Convert uploaded mesh/data file to target format."""
    try:
        contents = await file.read()
        result = converter.convert(contents, file.filename, target_format)
        return JSONResponse(
            content={
                "success": True,
                "filename": result["filename"],
                "size": result["size"],
                "format": target_format,
            },
            headers={
                "Content-Disposition": f'attachment; filename="{result["filename"]}"',
            },
        )
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": str(e)},
        )


@app.get("/api/formats")
async def supported_formats():
    """Return list of supported conversion formats."""
    return {
        "formats": converter.supported_formats(),
    }


# ===== WebSocket Collaboration =====

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message["type"] == "cursor_move":
                await manager.broadcast(
                    session_id,
                    {
                        "type": "cursor_move",
                        "userId": message["userId"],
                        "position": message["position"],
                        "color": message.get("color", "#4fc3f7"),
                    },
                    exclude=websocket,
                )
            elif message["type"] == "pipeline_update":
                await manager.broadcast(
                    session_id,
                    {
                        "type": "pipeline_update",
                        "userId": message["userId"],
                        "pipeline": message["pipeline"],
                    },
                    exclude=websocket,
                )
            elif message["type"] == "view_state":
                await manager.broadcast(
                    session_id,
                    {
                        "type": "view_state",
                        "userId": message["userId"],
                        "camera": message["camera"],
                        "renderConfig": message.get("renderConfig"),
                    },
                    exclude=websocket,
                )
            elif message["type"] == "chat":
                await manager.broadcast(
                    session_id,
                    {
                        "type": "chat",
                        "userId": message["userId"],
                        "userName": message.get("userName", "Anonymous"),
                        "text": message["text"],
                        "timestamp": message.get("timestamp"),
                    },
                )
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
        await manager.broadcast(
            session_id,
            {
                "type": "user_left",
                "userId": "unknown",
            },
        )


# ===== Session Management =====

sessions: dict = {}


@app.post("/api/session/create")
async def create_session():
    """Create a new collaboration session."""
    session_id = str(uuid.uuid4())[:8]
    sessions[session_id] = {"id": session_id, "users": []}
    return {"sessionId": session_id}


@app.get("/api/session/{session_id}")
async def get_session(session_id: str):
    """Get session info."""
    if session_id not in sessions:
        return JSONResponse(
            status_code=404,
            content={"error": "Session not found"},
        )
    return sessions[session_id]


# ===== WASM Compilation =====

@app.post("/api/wasm/compile")
async def compile_wasm(file: UploadFile = File(...)):
    """Compile uploaded C/C++ code to WebAssembly (stub — requires Emscripten)."""
    contents = await file.read()
    # Stub: In production, this would invoke emcc
    return {
        "success": True,
        "message": "WASM compilation request received. In production, this runs emscripten.",
        "sourceSize": len(contents),
        "outputFile": f"{file.filename}.wasm",
    }
