// avatar/PixelRenderer.js
// Core rendering engine — draws pixel art on an HTML5 canvas.
// Each "pixel" is actually a small square (e.g., 4x4 real pixels).
// This is exactly how CryptoPunks works: a small grid scaled up.

export default class PixelRenderer {
  /**
   * @param {number} gridSize - How many pixels wide/tall the art grid is (e.g., 32 = 32x32 grid)
   * @param {number} pixelScale - How many real screen pixels each art pixel takes (e.g., 4 = each pixel is 4x4)
   */
  constructor(gridSize = 32, pixelScale = 4) {
    this.gridSize = gridSize;
    this.pixelScale = pixelScale;

    // Create an offscreen canvas for rendering
    this.canvas = document.createElement("canvas");
    this.canvas.width = gridSize * pixelScale;
    this.canvas.height = gridSize * pixelScale;
    this.ctx = this.canvas.getContext("2d");

    // Disable image smoothing so pixels stay crisp when scaled
    this.ctx.imageSmoothingEnabled = false;
  }

  // Clear the entire canvas
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Draw a single pixel at grid position (x, y) with the given color
  drawPixel(x, y, color) {
    if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) return;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      x * this.pixelScale,
      y * this.pixelScale,
      this.pixelScale,
      this.pixelScale
    );
  }

  // Draw a filled rectangle of pixels
  drawRect(x, y, width, height, color) {
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        this.drawPixel(x + px, y + py, color);
      }
    }
  }

  // Draw pixels from a 2D array template
  // template[row][col] = color string or null (transparent)
  drawTemplate(template, offsetX = 0, offsetY = 0) {
    for (let row = 0; row < template.length; row++) {
      for (let col = 0; col < template[row].length; col++) {
        const color = template[row][col];
        if (color) {
          this.drawPixel(offsetX + col, offsetY + row, color);
        }
      }
    }
  }

  // Export the canvas as a PNG data URL
  toPNG() {
    return this.canvas.toDataURL("image/png");
  }

  // Export as a Blob (for file downloads)
  toBlob() {
    return new Promise((resolve) => {
      this.canvas.toBlob(resolve, "image/png");
    });
  }

  // Get the raw canvas element (useful for displaying in the DOM)
  getCanvas() {
    return this.canvas;
  }
}
