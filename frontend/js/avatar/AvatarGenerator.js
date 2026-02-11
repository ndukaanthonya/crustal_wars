// avatar/AvatarGenerator.js
// Main avatar generator — combines species templates, color palettes,
// eye styles, patterns, and accessories into unique pixel art avatars.
// This is the CryptoPunks-style engine that creates each player's NFT.

import PixelRenderer from "./PixelRenderer.js";
import { SPECIES_DRAW_MAP } from "./species.js";
import {
  COLOR_PALETTES,
  EYE_STYLES,
  BODY_PATTERNS,
  ACCESSORIES,
  SPECIES_LIST,
  IRIS_COLORS,
} from "./traits.js";

export default class AvatarGenerator {
  constructor() {
    // 32x32 pixel grid, each pixel rendered at 8x real pixels = 256x256 image
    this.renderer = new PixelRenderer(32, 8);
  }

  /**
   * Generate a random avatar with fully random traits.
   * @returns {object} { canvas, png, traits }
   */
  generateRandom() {
    const species = this.randomFrom(SPECIES_LIST);
    return this.generate(species);
  }

  /**
   * Generate an avatar for a specific species with random traits.
   * @param {string} species - One of the 7 species names
   * @returns {object} { canvas, png, traits }
   */
  generate(species) {
    // Pick random traits
    const palette = this.randomFrom(COLOR_PALETTES[species]);
    const eyeStyle = this.randomFrom(EYE_STYLES);
    const pattern = this.randomFrom(BODY_PATTERNS);
    const accessory = this.randomFrom(ACCESSORIES);
    const irisColor = this.randomFrom(IRIS_COLORS);

    // Build the trait record (this becomes NFT metadata later)
    const traits = {
      species,
      palette: { ...palette },
      eyeStyle: eyeStyle.name,
      pattern: pattern.name,
      accessory: accessory.name,
      irisColor,
    };

    // Render the avatar
    this.renderAvatar(species, palette, eyeStyle, pattern, accessory, irisColor);

    return {
      canvas: this.renderer.getCanvas(),
      png: this.renderer.toPNG(),
      traits,
    };
  }

  /**
   * Generate an avatar from a seed (for deterministic generation from on-chain data).
   * The seed is a hex string (e.g., blockhash) that determines all traits.
   * @param {string} seed - Hex string seed
   * @returns {object} { canvas, png, traits }
   */
  generateFromSeed(seed) {
    // Use seed characters to pick traits deterministically
    const nums = this.seedToNumbers(seed, 6);

    const species = SPECIES_LIST[nums[0] % SPECIES_LIST.length];
    const palette = COLOR_PALETTES[species][nums[1] % COLOR_PALETTES[species].length];
    const eyeStyle = EYE_STYLES[nums[2] % EYE_STYLES.length];
    const pattern = BODY_PATTERNS[nums[3] % BODY_PATTERNS.length];
    const accessory = ACCESSORIES[nums[4] % ACCESSORIES.length];
    const irisColor = IRIS_COLORS[nums[5] % IRIS_COLORS.length];

    const traits = {
      species,
      palette: { ...palette },
      eyeStyle: eyeStyle.name,
      pattern: pattern.name,
      accessory: accessory.name,
      irisColor,
    };

    this.renderAvatar(species, palette, eyeStyle, pattern, accessory, irisColor);

    return {
      canvas: this.renderer.getCanvas(),
      png: this.renderer.toPNG(),
      traits,
    };
  }

  /**
   * Core render function — draws the complete avatar onto the canvas.
   */
  renderAvatar(species, palette, eyeStyle, pattern, accessory, irisColor) {
    this.renderer.clear();

    // 1. Draw the base species body
    const drawFn = SPECIES_DRAW_MAP[species];
    if (!drawFn) {
      console.error(`Unknown species: ${species}`);
      return;
    }
    const baseGrid = drawFn(palette);

    // 2. Apply body pattern on top
    this.applyPattern(baseGrid, pattern, palette.accent);

    // 3. Draw the base grid to canvas
    this.renderer.drawTemplate(baseGrid);

    // 4. Draw eyes on the face
    this.drawEyes(species, eyeStyle, irisColor);

    // 5. Draw accessory
    this.drawAccessory(species, accessory);
  }

  /**
   * Apply a body pattern to the base grid.
   */
  applyPattern(grid, pattern, color) {
    if (pattern.name === "none") return;

    if (pattern.name === "stripes") {
      // Horizontal stripe pattern
      pattern.rows.forEach((row) => {
        for (let x = pattern.startX; x < pattern.startX + pattern.width; x++) {
          if (row < 32 && x < 32 && grid[row][x]) {
            grid[row][x] = color;
          }
        }
      });
    } else if (pattern.pixels) {
      // Pixel-based pattern (spots, diamond, zigzag)
      pattern.pixels.forEach(({ x, y }) => {
        if (y < 32 && x < 32 && grid[y][x]) {
          grid[y][x] = color;
        }
      });
    }
  }

  /**
   * Draw eyes on the avatar face.
   * Position varies by species (each species has eyes in different spots).
   */
  drawEyes(species, eyeStyle, irisColor) {
    // Eye positions for each species (left eye x,y — right eye is offset by ~6 pixels)
    const eyePositions = {
      lobster:     { lx: 10, ly: 11, rx: 17, ry: 11 },
      squid:       { lx: 10, ly: 10, rx: 17, ry: 10 },
      octopus:     { lx: 10, ly: 8,  rx: 17, ry: 8  },
      shrimp:      { lx: 13, ly: 7,  rx: 18, ry: 7  },
      hermitCrab:  { lx: 22, ly: 14, rx: 26, ry: 14 },
      nautilus:    { lx: 23, ly: 13, rx: 23, ry: 13 }, // Only one visible eye
      pufferfish:  { lx: 10, ly: 12, rx: 17, ry: 12 },
    };

    const pos = eyePositions[species] || { lx: 10, ly: 10, rx: 17, ry: 10 };

    // Draw left eye
    this.drawEyePattern(pos.lx, pos.ly, eyeStyle.pattern, irisColor);

    // Draw right eye (skip for nautilus — side view, only one eye visible)
    if (species !== "nautilus") {
      this.drawEyePattern(pos.rx, pos.ry, eyeStyle.pattern, irisColor);
    }
  }

  /**
   * Draw a single eye from its pattern template.
   */
  drawEyePattern(x, y, pattern, irisColor) {
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        let color = pattern[row][col];
        if (!color) continue;

        // Replace color codes with actual colors
        if (color === "W") color = "#ffffff";
        if (color === "B") color = "#000000";
        if (color === "C") color = irisColor;

        this.renderer.drawPixel(x + col, y + row, color);
      }
    }
  }

  /**
   * Draw an accessory on the avatar.
   * Position is relative to the head area, adjusted per species.
   */
  drawAccessory(species, accessory) {
    if (accessory.name === "none" || !accessory.template.length) return;

    // Base accessory position per species (top of head area)
    const headTops = {
      lobster:     { x: 13, y: 4 },
      squid:       { x: 13, y: 2 },
      octopus:     { x: 13, y: 1 },
      shrimp:      { x: 13, y: 4 },
      hermitCrab:  { x: 19, y: 8 },
      nautilus:    { x: 20, y: 6 },
      pufferfish:  { x: 13, y: 4 },
    };

    const base = headTops[species] || { x: 13, y: 4 };
    const ox = base.x + accessory.offsetX;
    const oy = base.y + accessory.offsetY;

    // Draw the accessory template
    for (let row = 0; row < accessory.template.length; row++) {
      for (let col = 0; col < accessory.template[row].length; col++) {
        const color = accessory.template[row][col];
        if (color) {
          this.renderer.drawPixel(ox + col, oy + row, color);
        }
      }
    }
  }

  /**
   * Convert a hex seed string into an array of numbers.
   * Used for deterministic trait selection from on-chain data.
   */
  seedToNumbers(seed, count) {
    // Remove "0x" prefix if present
    const hex = seed.replace("0x", "");
    const nums = [];
    const chunkSize = Math.floor(hex.length / count);

    for (let i = 0; i < count; i++) {
      const chunk = hex.slice(i * chunkSize, (i + 1) * chunkSize);
      nums.push(parseInt(chunk, 16) || 0);
    }

    return nums;
  }

  /**
   * Pick a random element from an array.
   */
  randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
