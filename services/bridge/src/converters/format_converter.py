"""
Format Converter — 数据格式转换服务

支持的转换: VTK ↔ GLTF ↔ OBJ ↔ STL ↔ PLY
使用 numpy 进行网格数据处理。
"""

import os
import numpy as np
from typing import List


class FormatConverter:
    """Convert between 3D data formats (VTK, GLTF, OBJ, STL, PLY)."""

    def __init__(self):
        self._formats = {
            "input": [".vtk", ".vtp", ".vti", ".obj", ".stl", ".ply"],
            "output": [".gltf", ".obj", ".stl", ".ply"],
        }

    def supported_formats(self) -> dict:
        return self._formats

    def convert(
        self,
        data: bytes,
        filename: str,
        target_format: str,
    ) -> dict:
        """
        Convert file data to target format.

        Args:
            data: Raw file bytes
            filename: Original filename (for extension detection)
            target_format: Desired output format (gltf, obj, stl, ply)

        Returns:
            dict with 'filename', 'size', 'data' keys
        """
        source_ext = os.path.splitext(filename)[1].lower()
        target_ext = f".{target_format.lstrip('.')}".lower()

        if target_ext not in self._formats["output"]:
            raise ValueError(f"Unsupported target format: {target_format}")

        # Parse source into unified mesh representation
        vertices, faces = self._parse(data, source_ext)

        # Serialize to target format
        output_data = self._serialize(vertices, faces, target_ext)
        output_name = f"{os.path.splitext(filename)[0]}{target_ext}"

        return {
            "filename": output_name,
            "size": len(output_data),
            "data": output_data.hex(),
            "vertexCount": len(vertices),
            "faceCount": len(faces),
        }

    def _parse(
        self, data: bytes, ext: str
    ) -> tuple[np.ndarray, np.ndarray]:
        """Parse binary file data into vertices and faces arrays."""
        # Stub: In production, uses VTK/VTK.js reader libraries
        # Returns sample mesh data for demonstration
        if ext in (".vtk", ".vtp", ".vti"):
            return self._parse_vtk(data)
        elif ext == ".obj":
            return self._parse_obj(data)
        elif ext == ".stl":
            return self._parse_stl(data)
        elif ext == ".ply":
            return self._parse_ply(data)
        else:
            return self._generate_sample_mesh()

    def _serialize(
        self, vertices: np.ndarray, faces: np.ndarray, ext: str
    ) -> bytes:
        """Serialize mesh data to target format bytes."""
        if ext == ".obj":
            return self._to_obj(vertices, faces)
        elif ext == ".stl":
            return self._to_stl(vertices, faces)
        elif ext == ".ply":
            return self._to_ply(vertices, faces)
        elif ext == ".gltf":
            return self._to_gltf(vertices, faces)
        return b""

    def _parse_obj(self, data: bytes) -> tuple[np.ndarray, np.ndarray]:
        text = data.decode("utf-8", errors="replace")
        vertices: List[List[float]] = []
        faces: List[List[int]] = []

        for line in text.splitlines():
            line = line.strip()
            if line.startswith("v "):
                parts = line.split()
                vertices.append([float(parts[1]), float(parts[2]), float(parts[3])])
            elif line.startswith("f "):
                parts = line.split()
                face = []
                for p in parts[1:]:
                    idx = p.split("/")[0]
                    face.append(int(idx) - 1)
                faces.append(face)

        return np.array(vertices, dtype=np.float32), np.array(faces, dtype=np.int32)

    def _parse_stl(self, data: bytes) -> tuple[np.ndarray, np.ndarray]:
        # Binary STL: 80-byte header, 4-byte count, then 50-byte triangles
        if len(data) < 84:
            return self._generate_sample_mesh()

        triangle_count = int.from_bytes(data[80:84], "little")
        vertices: List[List[float]] = []
        faces: List[List[int]] = []

        for i in range(triangle_count):
            offset = 84 + i * 50
            if offset + 48 > len(data):
                break
            tri_verts = []
            for j in range(3):
                v_off = offset + 12 + j * 12
                x = float.from_bytes(data[v_off : v_off + 4], "little")
                y = float.from_bytes(data[v_off + 4 : v_off + 8], "little")
                z = float.from_bytes(data[v_off + 8 : v_off + 12], "little")
                tri_verts.append([x, y, z])
            base = len(vertices)
            vertices.extend(tri_verts)
            faces.append([base, base + 1, base + 2])

        return np.array(vertices, dtype=np.float32), np.array(faces, dtype=np.int32)

    def _parse_vtk(self, data: bytes) -> tuple[np.ndarray, np.ndarray]:
        # Stub: VTK legacy format parsing
        return self._generate_sample_mesh()

    def _parse_ply(self, data: bytes) -> tuple[np.ndarray, np.ndarray]:
        # Stub: PLY format parsing
        return self._generate_sample_mesh()

    def _generate_sample_mesh(self) -> tuple[np.ndarray, np.ndarray]:
        """Generate a sample cube mesh for testing."""
        vertices = np.array(
            [
                [-1, -1, -1],
                [1, -1, -1],
                [1, 1, -1],
                [-1, 1, -1],
                [-1, -1, 1],
                [1, -1, 1],
                [1, 1, 1],
                [-1, 1, 1],
            ],
            dtype=np.float32,
        )
        faces = np.array(
            [
                [0, 1, 2],
                [0, 2, 3],
                [4, 5, 6],
                [4, 6, 7],
                [0, 1, 5],
                [0, 5, 4],
                [2, 3, 7],
                [2, 7, 6],
                [0, 3, 7],
                [0, 7, 4],
                [1, 2, 6],
                [1, 6, 5],
            ],
            dtype=np.int32,
        )
        return vertices, faces

    def _to_obj(self, vertices: np.ndarray, faces: np.ndarray) -> bytes:
        lines = ["# Generated by VizForge Bridge"]
        for v in vertices:
            lines.append(f"v {v[0]:.6f} {v[1]:.6f} {v[2]:.6f}")
        for f in faces:
            lines.append("f " + " ".join(str(i + 1) for i in f))
        return "\n".join(lines).encode("utf-8")

    def _to_stl(self, vertices: np.ndarray, faces: np.ndarray) -> bytes:
        # Binary STL
        header = b"\x00" * 80
        count = len(faces)
        header += count.to_bytes(4, "little")

        tri_data = bytearray()
        for face in faces:
            # Normal (stub: zero)
            tri_data += b"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
            for idx in face:
                v = vertices[idx]
                tri_data += struct_pack_float(v[0])
                tri_data += struct_pack_float(v[1])
                tri_data += struct_pack_float(v[2])
            tri_data += b"\x00\x00"  # attribute byte count

        return header + bytes(tri_data)

    def _to_ply(self, vertices: np.ndarray, faces: np.ndarray) -> bytes:
        lines = [
            "ply",
            "format ascii 1.0",
            f"element vertex {len(vertices)}",
            "property float x",
            "property float y",
            "property float z",
            f"element face {len(faces)}",
            "property list uchar int vertex_index",
            "end_header",
        ]
        for v in vertices:
            lines.append(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}")
        for f in faces:
            lines.append(f"3 {f[0]} {f[1]} {f[2]}")
        return "\n".join(lines).encode("utf-8")

    def _to_gltf(self, vertices: np.ndarray, faces: np.ndarray) -> bytes:
        # Minimal GLTF 2.0 JSON output with embedded buffer
        import json

        vert_bytes = vertices.tobytes()
        index_bytes = faces.tobytes()
        buffer_data = vert_bytes + index_bytes

        gltf = {
            "asset": {"version": "2.0", "generator": "VizForge Bridge"},
            "scene": 0,
            "scenes": [{"nodes": [0]}],
            "nodes": [{"mesh": 0}],
            "meshes": [
                {
                    "primitives": [
                        {
                            "attributes": {"POSITION": 0},
                            "indices": 1,
                            "mode": 4,
                        }
                    ]
                }
            ],
            "accessors": [
                {
                    "bufferView": 0,
                    "componentType": 5126,  # FLOAT
                    "count": len(vertices),
                    "type": "VEC3",
                    "min": vertices.min(axis=0).tolist(),
                    "max": vertices.max(axis=0).tolist(),
                },
                {
                    "bufferView": 1,
                    "componentType": 5125,  # UNSIGNED_INT
                    "count": faces.size,
                    "type": "SCALAR",
                    "min": [int(faces.min())],
                    "max": [int(faces.max())],
                },
            ],
            "bufferViews": [
                {"buffer": 0, "byteOffset": 0, "byteLength": len(vert_bytes)},
                {
                    "buffer": 0,
                    "byteOffset": len(vert_bytes),
                    "byteLength": len(index_bytes),
                },
            ],
            "buffers": [
                {
                    "byteLength": len(buffer_data),
                    "uri": f"data:application/octet-stream;base64,{base64_encode(buffer_data)}",
                }
            ],
        }
        return json.dumps(gltf, separators=(",", ":")).encode("utf-8")


def struct_pack_float(value: float) -> bytes:
    import struct
    return struct.pack("<f", value)


def base64_encode(data: bytes) -> str:
    import base64
    return base64.b64encode(data).decode("ascii")
