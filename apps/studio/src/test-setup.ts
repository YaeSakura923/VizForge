/// <reference types="vitest/globals" />

import '@testing-library/jest-dom';

// Mock WebGL for testing environment (vitest/jsdom compatibility)
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: function () {
    return {
      drawImage: () => {},
      getImageData: () => ({ data: [] as number[] }),
      putImageData: () => {},
      createImageData: () => [] as unknown as ImageData,
      canvas: this,
      clearRect: () => {},
      fillRect: () => {},
      fillText: () => {},
      measureText: () => ({ width: 0 }),
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      save: () => {},
      restore: () => {},
    } as unknown as CanvasRenderingContext2D;
  },
  writable: false,
});
