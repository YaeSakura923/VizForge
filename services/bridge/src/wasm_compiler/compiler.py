"""
WASM Compiler — WebAssembly 编译服务

在服务端使用 Emscripten 编译 C/C++ 滤波器为 WASM。
当前为桩实现，生产环境需安装 emsdk。
"""

from typing import Optional


class WasmCompiler:
    """
    Compile C/C++ source code to WebAssembly.

    In production, this invokes emcc (Emscripten compiler).
    The current implementation validates source and returns
    compilation metadata without actually running emcc.
    """

    def __init__(self, emscripten_path: Optional[str] = None):
        self.emscripten_path = emscripten_path

    def compile(self, source: str, filename: str) -> dict:
        """
        Validate and (in production) compile source to WASM.

        Returns compilation metadata including size estimates
        and any validation errors.
        """
        errors = self._validate(source)

        return {
            "success": len(errors) == 0,
            "errors": errors,
            "sourceFile": filename,
            "sourceLines": len(source.splitlines()),
            "sourceSize": len(source.encode("utf-8")),
            "estimatedWasmSize": len(source) // 2,  # rough heuristic
            "note": "Production compilation requires emcc (Emscripten SDK)",
        }

    def _validate(self, source: str) -> list[str]:
        """Basic validation of C/C++ source."""
        errors = []
        if not source.strip():
            errors.append("Source is empty")
            return errors

        lines = source.splitlines()
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            # Check for extremely long lines
            if len(line) > 2000:
                errors.append(f"Line {i}: too long ({len(line)} chars)")
            # Check for unclosed multi-line comments
            if "/*" in stripped and "*/" not in stripped:
                errors.append(f"Line {i}: unclosed multi-line comment")

        return errors


# Example filter: Gaussian blur in C
GAUSSIAN_BLUR_FILTER = """/*
 * Gaussian Blur Filter — 3D Volume
 * Input: float volume[NX][NY][NZ]
 * Output: float filtered[NX][NY][NZ]
 */

#include <math.h>
#include <stdint.h>

#define NX 64
#define NY 64
#define NZ 64
#define KERNEL_RADIUS 2
#define KERNEL_SIZE (2 * KERNEL_RADIUS + 1)

void gaussian_blur(
    const float* input,
    float* output,
    int nx, int ny, int nz
) {
    float kernel[KERNEL_SIZE];
    float sigma = 1.0f;
    float sum = 0.0f;

    // Generate Gaussian kernel
    for (int i = -KERNEL_RADIUS; i <= KERNEL_RADIUS; i++) {
        float val = expf(-(i * i) / (2.0f * sigma * sigma));
        kernel[i + KERNEL_RADIUS] = val;
        sum += val;
    }
    for (int i = 0; i < KERNEL_SIZE; i++)
        kernel[i] /= sum;

    // Convolve along X
    float temp[NX * NY * NZ];
    for (int z = 0; z < nz; z++)
    for (int y = 0; y < ny; y++)
    for (int x = 0; x < nx; x++) {
        float val = 0.0f;
        for (int k = -KERNEL_RADIUS; k <= KERNEL_RADIUS; k++) {
            int cx = x + k;
            if (cx < 0) cx = 0;
            if (cx >= nx) cx = nx - 1;
            val += input[z * ny * nx + y * nx + cx] * kernel[k + KERNEL_RADIUS];
        }
        temp[z * ny * nx + y * nx + x] = val;
    }

    // Convolve along Y
    for (int z = 0; z < nz; z++)
    for (int y = 0; y < ny; y++)
    for (int x = 0; x < nx; x++) {
        float val = 0.0f;
        for (int k = -KERNEL_RADIUS; k <= KERNEL_RADIUS; k++) {
            int cy = y + k;
            if (cy < 0) cy = 0;
            if (cy >= ny) cy = ny - 1;
            val += temp[z * ny * nx + cy * nx + x] * kernel[k + KERNEL_RADIUS];
        }
        output[z * ny * nx + y * nx + x] = val;
    }
}
"""
