// avatar/traits.js
// Defines all randomizable traits for sea creature avatars.
// Each avatar is assembled from: species + color palette + eye style + pattern + accessory
// This is the "DNA" that makes each NFT unique.

// ============================================================
// COLOR PALETTES — Each species picks one palette randomly.
// Contains: body (main), accent (highlights), dark (outlines/shadows), light (belly/underbody)
// ============================================================
export const COLOR_PALETTES = {
  lobster: [
    { body: "#c0392b", accent: "#e74c3c", dark: "#7b241c", light: "#f1948a" },
    { body: "#d35400", accent: "#e67e22", dark: "#873600", light: "#f0b27a" },
    { body: "#922b21", accent: "#cb4335", dark: "#641e16", light: "#d98880" },
    { body: "#b03a2e", accent: "#ec7063", dark: "#78281f", light: "#f5b7b1" },
    { body: "#a04000", accent: "#dc7633", dark: "#6e2c00", light: "#f8c471" },
  ],
  squid: [
    { body: "#8e44ad", accent: "#a569bd", dark: "#6c3483", light: "#d2b4de" },
    { body: "#2980b9", accent: "#5dade2", dark: "#1a5276", light: "#aed6f1" },
    { body: "#c0392b", accent: "#e74c3c", dark: "#922b21", light: "#f5b7b1" },
    { body: "#1abc9c", accent: "#48c9b0", dark: "#0e6655", light: "#a3e4d7" },
    { body: "#2c3e50", accent: "#5d6d7e", dark: "#1b2631", light: "#aeb6bf" },
  ],
  octopus: [
    { body: "#e74c3c", accent: "#f1948a", dark: "#922b21", light: "#fadbd8" },
    { body: "#9b59b6", accent: "#c39bd3", dark: "#6c3483", light: "#e8daef" },
    { body: "#e67e22", accent: "#f0b27a", dark: "#a04000", light: "#fdebd0" },
    { body: "#2ecc71", accent: "#82e0aa", dark: "#1e8449", light: "#d5f5e3" },
    { body: "#3498db", accent: "#85c1e9", dark: "#1f618d", light: "#d6eaf8" },
  ],
  shrimp: [
    { body: "#f1948a", accent: "#f5b7b1", dark: "#c0392b", light: "#fadbd8" },
    { body: "#f0b27a", accent: "#f8c471", dark: "#d35400", light: "#fdebd0" },
    { body: "#e74c3c", accent: "#ec7063", dark: "#922b21", light: "#f5b7b1" },
    { body: "#eb984e", accent: "#f5cba7", dark: "#af601a", light: "#fae5d3" },
    { body: "#d4ac0d", accent: "#f4d03f", dark: "#9a7d0a", light: "#fcf3cf" },
  ],
  hermitCrab: [
    { body: "#dc7633", accent: "#eb984e", dark: "#935116", light: "#f5cba7" },
    { body: "#839192", accent: "#aab7b8", dark: "#515a5a", light: "#d5dbdb" },
    { body: "#b9770e", accent: "#d4ac0d", dark: "#7d5109", light: "#f9e79f" },
    { body: "#a04000", accent: "#d35400", dark: "#6e2c00", light: "#f0b27a" },
    { body: "#7b7d7d", accent: "#b2babb", dark: "#4d5656", light: "#d5d8dc" },
  ],
  nautilus: [
    { body: "#d4ac0d", accent: "#f4d03f", dark: "#9a7d0a", light: "#fcf3cf" },
    { body: "#e67e22", accent: "#f0b27a", dark: "#a04000", light: "#fdebd0" },
    { body: "#af601a", accent: "#dc7633", dark: "#784212", light: "#f5cba7" },
    { body: "#b7950b", accent: "#d4ac0d", dark: "#7d6608", light: "#f9e79f" },
    { body: "#ca6f1e", accent: "#eb984e", dark: "#8e4e0e", light: "#fad7a0" },
  ],
  pufferfish: [
    { body: "#f4d03f", accent: "#f9e79f", dark: "#b7950b", light: "#fcf3cf" },
    { body: "#5dade2", accent: "#aed6f1", dark: "#2e86c1", light: "#d6eaf8" },
    { body: "#58d68d", accent: "#abebc6", dark: "#28b463", light: "#d5f5e3" },
    { body: "#f1948a", accent: "#f5b7b1", dark: "#e74c3c", light: "#fadbd8" },
    { body: "#bb8fce", accent: "#d7bde2", dark: "#8e44ad", light: "#ebdef0" },
  ],
};

// ============================================================
// EYE STYLES — Different eye designs drawn as small pixel grids
// Each eye is a mini template (rows x cols) placed on the face
// Colors: "W" = white, "B" = black/pupil, "C" = colored iris, null = transparent
// ============================================================
export const EYE_STYLES = [
  {
    name: "round",
    // Simple round eye: white with black pupil
    pattern: [
      [null, "W", "W", null],
      ["W", "W", "B", "W"],
      ["W", "W", "B", "W"],
      [null, "W", "W", null],
    ],
  },
  {
    name: "wide",
    // Wide surprised eye
    pattern: [
      ["W", "W", "W", "W"],
      ["W", "C", "B", "W"],
      ["W", "C", "B", "W"],
      ["W", "W", "W", "W"],
    ],
  },
  {
    name: "angry",
    // Angry squinted eye
    pattern: [
      [null, null, null, null],
      [null, "W", "W", null],
      ["W", "C", "B", "W"],
      ["W", "W", "W", "W"],
    ],
  },
  {
    name: "cute",
    // Big cute eye with shine
    pattern: [
      [null, "W", "W", null],
      ["W", "B", "B", "W"],
      ["W", "B", "W", "W"],
      [null, "W", "W", null],
    ],
  },
  {
    name: "sleepy",
    // Half-closed sleepy eye
    pattern: [
      [null, null, null, null],
      [null, null, null, null],
      ["W", "W", "B", "W"],
      ["W", "W", "W", "W"],
    ],
  },
];

// ============================================================
// PATTERNS — Decorative body markings (drawn on top of base body)
// "X" = pattern color (uses accent from palette), null = skip
// ============================================================
export const BODY_PATTERNS = [
  {
    name: "none",
    // No pattern — clean look
    pixels: [],
  },
  {
    name: "spots",
    // Scattered spots on the body
    pixels: [
      { x: 3, y: 5 },
      { x: 7, y: 4 },
      { x: 5, y: 8 },
      { x: 9, y: 6 },
      { x: 4, y: 10 },
      { x: 8, y: 9 },
    ],
  },
  {
    name: "stripes",
    // Horizontal stripes across body
    rows: [4, 7, 10, 13],
    width: 8,
    startX: 2,
  },
  {
    name: "diamond",
    // Diamond pattern on back
    pixels: [
      { x: 6, y: 5 },
      { x: 5, y: 6 }, { x: 7, y: 6 },
      { x: 4, y: 7 }, { x: 8, y: 7 },
      { x: 5, y: 8 }, { x: 7, y: 8 },
      { x: 6, y: 9 },
    ],
  },
  {
    name: "zigzag",
    // Zigzag line across body
    pixels: [
      { x: 2, y: 6 }, { x: 3, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 5 },
      { x: 6, y: 6 }, { x: 7, y: 5 }, { x: 8, y: 6 }, { x: 9, y: 5 },
    ],
  },
];

// ============================================================
// ACCESSORIES — Small items placed on/near the creature
// Drawn as mini pixel templates with an offset position
// ============================================================
export const ACCESSORIES = [
  {
    name: "none",
    template: [],
    offsetX: 0,
    offsetY: 0,
  },
  {
    name: "crown",
    // Small golden crown on top of head
    template: [
      [null, "#ffd700", null, "#ffd700", null],
      ["#ffd700", "#ffd700", "#ffd700", "#ffd700", "#ffd700"],
      ["#ffd700", "#fff44f", "#ffd700", "#fff44f", "#ffd700"],
    ],
    offsetX: -2,
    offsetY: -3,
  },
  {
    name: "eyepatch",
    // Pirate eyepatch over one eye
    template: [
      [null, "#333", "#333", null],
      ["#333", "#1a1a1a", "#1a1a1a", "#333"],
      [null, "#333", "#333", null],
    ],
    offsetX: 6,
    offsetY: 0,
  },
  {
    name: "bandana",
    // Red bandana wrapped on head
    template: [
      ["#cc0000", "#cc0000", "#cc0000", "#cc0000", "#cc0000", "#cc0000"],
      ["#990000", "#cc0000", "#cc0000", "#cc0000", "#cc0000", "#990000"],
      [null, null, null, null, "#cc0000", "#cc0000"],
    ],
    offsetX: -2,
    offsetY: -2,
  },
  {
    name: "bubble",
    // Small floating bubble next to head
    template: [
      [null, "#aaddff", null],
      ["#aaddff", "#ffffff", "#aaddff"],
      [null, "#aaddff", null],
    ],
    offsetX: 10,
    offsetY: -3,
  },
  {
    name: "scar",
    // Battle scar across face
    template: [
      ["#aa3333", null, null],
      [null, "#aa3333", null],
      [null, null, "#aa3333"],
    ],
    offsetX: 2,
    offsetY: 1,
  },
];

// ============================================================
// SPECIES LIST — Used for random selection
// ============================================================
export const SPECIES_LIST = [
  "lobster",
  "squid",
  "octopus",
  "shrimp",
  "hermitCrab",
  "nautilus",
  "pufferfish",
];

// ============================================================
// IRIS COLORS — For colored iris in eye styles that use "C"
// ============================================================
export const IRIS_COLORS = [
  "#2ecc71", // green
  "#3498db", // blue
  "#e74c3c", // red
  "#f39c12", // amber
  "#9b59b6", // purple
  "#1abc9c", // teal
  "#e67e22", // orange
];
