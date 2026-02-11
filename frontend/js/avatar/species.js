// avatar/species.js
// Pixel art templates for all 7 sea creature species.
// Each function takes a color palette and returns a 2D array (32x32 grid).
// null = transparent pixel, color string = filled pixel.
// These templates define the HEAD of each creature (sits on the game character body).

// Helper: create an empty 32x32 grid
function emptyGrid() {
  return Array.from({ length: 32 }, () => Array(32).fill(null));
}

// Helper: draw a filled circle of pixels on a grid
function fillCircle(grid, cx, cy, radius, color) {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= radius) {
        grid[y][x] = color;
      }
    }
  }
}

// Helper: draw an ellipse
function fillEllipse(grid, cx, cy, rx, ry, color) {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const val = ((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2);
      if (val <= 1) {
        grid[y][x] = color;
      }
    }
  }
}

// Helper: draw a rectangle
function fillRect(grid, sx, sy, w, h, color) {
  for (let y = sy; y < sy + h && y < 32; y++) {
    for (let x = sx; x < sx + w && x < 32; x++) {
      if (x >= 0 && y >= 0) grid[y][x] = color;
    }
  }
}

// Helper: draw outline pixels around existing filled pixels
function addOutline(grid, outlineColor) {
  const copy = grid.map((row) => [...row]);
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      if (!copy[y][x]) {
        // Check if any neighbor has a pixel
        for (const [dx, dy] of dirs) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < 32 && ny >= 0 && ny < 32 && copy[ny][nx]) {
            grid[y][x] = outlineColor;
            break;
          }
        }
      }
    }
  }
}

// ============================================================
// LOBSTER — Large claws, segmented body, antennae
// ============================================================
export function drawLobster(palette) {
  const grid = emptyGrid();
  const { body, accent, dark, light } = palette;

  // Main head shape — tall oval
  fillEllipse(grid, 15, 14, 9, 11, body);

  // Lighter belly/front
  fillEllipse(grid, 15, 16, 5, 6, light);

  // Segmented lines (horizontal)
  for (let x = 8; x <= 22; x++) {
    if (grid[10][x]) grid[10][x] = dark;
    if (grid[18][x]) grid[18][x] = dark;
  }

  // Left claw
  fillEllipse(grid, 5, 10, 4, 3, body);
  fillEllipse(grid, 5, 10, 2, 1, accent);
  // Claw pincer
  fillRect(grid, 2, 7, 2, 2, dark);
  fillRect(grid, 6, 7, 2, 2, dark);

  // Right claw
  fillEllipse(grid, 25, 10, 4, 3, body);
  fillEllipse(grid, 25, 10, 2, 1, accent);
  fillRect(grid, 24, 7, 2, 2, dark);
  fillRect(grid, 28, 7, 2, 2, dark);

  // Antennae (thin lines going up)
  grid[2][12] = accent;
  grid[1][11] = accent;
  grid[0][10] = accent;
  grid[2][18] = accent;
  grid[1][19] = accent;
  grid[0][20] = accent;

  // Antenna base
  grid[3][12] = dark;
  grid[3][18] = dark;

  // Small legs at bottom
  for (let i = 0; i < 3; i++) {
    const lx = 9 + i * 3;
    grid[26][lx] = dark;
    grid[27][lx] = dark;
    grid[26][lx + 1] = dark;
  }

  // Outline
  addOutline(grid, dark);

  return grid;
}

// ============================================================
// SQUID — Torpedo head, big eyes, trailing tentacles
// ============================================================
export function drawSquid(palette) {
  const grid = emptyGrid();
  const { body, accent, dark, light } = palette;

  // Torpedo/cone head shape — pointed top, wider bottom
  fillEllipse(grid, 15, 12, 8, 10, body);

  // Pointed top (mantle)
  fillRect(grid, 13, 1, 5, 4, body);
  fillRect(grid, 14, 0, 3, 2, accent);

  // Fin flaps on sides
  // Left fin
  grid[8][5] = accent;
  grid[9][4] = accent;
  grid[10][4] = accent;
  grid[11][5] = accent;
  grid[9][5] = body;
  grid[10][5] = body;

  // Right fin
  grid[8][25] = accent;
  grid[9][26] = accent;
  grid[10][26] = accent;
  grid[11][25] = accent;
  grid[9][25] = body;
  grid[10][25] = body;

  // Lighter underbelly
  fillEllipse(grid, 15, 14, 4, 5, light);

  // Tentacles hanging down (8 tentacles)
  for (let i = 0; i < 8; i++) {
    const tx = 9 + i * 2;
    const waviness = i % 2 === 0 ? 0 : 1;
    grid[23][tx] = body;
    grid[24][tx + waviness] = body;
    grid[25][tx] = accent;
    grid[26][tx + waviness] = accent;
    grid[27][tx] = body;
    if (i % 3 === 0) {
      grid[28][tx + waviness] = accent;
      grid[29][tx] = body;
    }
  }

  // Outline
  addOutline(grid, dark);

  return grid;
}

// ============================================================
// OCTOPUS — Round head, 8 curling tentacles, bulbous
// ============================================================
export function drawOctopus(palette) {
  const grid = emptyGrid();
  const { body, accent, dark, light } = palette;

  // Big round head
  fillCircle(grid, 15, 10, 10, body);

  // Lighter face area
  fillCircle(grid, 15, 11, 6, light);

  // Bulges on top of head
  fillCircle(grid, 10, 5, 3, accent);
  fillCircle(grid, 20, 5, 3, accent);

  // 8 tentacles curling outward from bottom
  const tentacleStarts = [5, 8, 11, 14, 17, 20, 23, 26];
  tentacleStarts.forEach((tx, i) => {
    const curl = i % 2 === 0 ? 1 : -1;
    grid[20][tx] = body;
    grid[21][tx] = body;
    grid[22][tx + curl] = body;
    grid[23][tx + curl] = accent;
    grid[24][tx + curl * 2] = accent;

    // Suction cups (tiny dots)
    if (i % 2 === 0) {
      grid[22][tx] = light;
      grid[23][tx + curl * 2] = light;
    }
  });

  // Outline
  addOutline(grid, dark);

  return grid;
}

// ============================================================
// SHRIMP — Curved body, long antennae, small claws, segmented
// ============================================================
export function drawShrimp(palette) {
  const grid = emptyGrid();
  const { body, accent, dark, light } = palette;

  // Curved shrimp body — a C-shape made from overlapping ellipses
  fillEllipse(grid, 15, 10, 7, 6, body);
  fillEllipse(grid, 13, 16, 6, 5, body);
  fillEllipse(grid, 15, 12, 4, 3, light);

  // Tail fan
  fillRect(grid, 7, 20, 3, 2, accent);
  fillRect(grid, 10, 21, 3, 2, body);
  fillRect(grid, 5, 21, 3, 2, accent);
  grid[22][6] = dark;
  grid[22][12] = dark;

  // Segments
  for (let x = 9; x <= 19; x++) {
    if (grid[8][x]) grid[8][x] = dark;
    if (grid[13][x]) grid[13][x] = dark;
  }

  // Long antennae
  grid[4][18] = accent;
  grid[3][19] = accent;
  grid[2][20] = accent;
  grid[1][21] = accent;
  grid[0][22] = accent;

  grid[4][20] = accent;
  grid[3][22] = accent;
  grid[2][24] = accent;
  grid[1][25] = accent;

  // Small front claws
  fillRect(grid, 20, 8, 3, 2, body);
  fillRect(grid, 23, 7, 2, 2, accent);
  fillRect(grid, 20, 11, 3, 2, body);
  fillRect(grid, 23, 11, 2, 2, accent);

  // Small legs
  for (let i = 0; i < 4; i++) {
    grid[18][10 + i * 2] = dark;
    grid[19][10 + i * 2] = dark;
  }

  // Outline
  addOutline(grid, dark);

  return grid;
}

// ============================================================
// HERMIT CRAB — Shell on back, peeking out, small eyes on stalks
// ============================================================
export function drawHermitCrab(palette) {
  const grid = emptyGrid();
  const { body, accent, dark, light } = palette;

  // Spiral shell (large)
  fillCircle(grid, 14, 12, 9, accent);
  fillCircle(grid, 14, 12, 6, body);
  fillCircle(grid, 14, 11, 3, dark);

  // Shell spiral lines
  fillCircle(grid, 14, 12, 7, null); // carve out for spiral effect
  fillCircle(grid, 14, 12, 9, accent);
  fillCircle(grid, 16, 11, 5, body);
  fillCircle(grid, 18, 10, 3, light);
  fillCircle(grid, 19, 9, 1, accent);

  // Crab body peeking out from shell opening (bottom-right)
  fillEllipse(grid, 20, 18, 5, 4, body);
  fillEllipse(grid, 20, 19, 3, 2, light);

  // Eye stalks
  grid[13][23] = dark;
  grid[12][23] = body;
  grid[11][23] = body;
  grid[10][24] = "#ffffff";
  grid[10][23] = "#000000";

  grid[13][26] = dark;
  grid[12][26] = body;
  grid[11][26] = body;
  grid[10][27] = "#ffffff";
  grid[10][26] = "#000000";

  // Small claws
  fillRect(grid, 24, 17, 3, 2, body);
  fillRect(grid, 27, 16, 2, 2, accent);
  fillRect(grid, 24, 21, 3, 2, body);
  fillRect(grid, 27, 21, 2, 2, accent);

  // Small legs
  for (let i = 0; i < 3; i++) {
    grid[23][18 + i * 2] = dark;
    grid[24][18 + i * 2] = dark;
  }

  // Outline
  addOutline(grid, dark);

  return grid;
}

// ============================================================
// NAUTILUS — Coiled spiral shell, small tentacles, ancient look
// ============================================================
export function drawNautilus(palette) {
  const grid = emptyGrid();
  const { body, accent, dark, light } = palette;

  // Large spiral shell — built from decreasing circles
  fillCircle(grid, 15, 14, 11, accent);
  fillCircle(grid, 15, 14, 9, body);
  fillCircle(grid, 14, 13, 7, accent);
  fillCircle(grid, 14, 13, 5, body);
  fillCircle(grid, 13, 12, 3, accent);
  fillCircle(grid, 13, 12, 1, dark);

  // Shell chamber lines (radial)
  for (let r = 3; r <= 11; r += 3) {
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
      const x = Math.round(15 + r * Math.cos(angle));
      const y = Math.round(14 + r * Math.sin(angle));
      if (x >= 0 && x < 32 && y >= 0 && y < 32 && grid[y][x]) {
        grid[y][x] = dark;
      }
    }
  }

  // Shell opening (right side) — lighter
  fillEllipse(grid, 24, 16, 4, 6, light);
  fillEllipse(grid, 24, 16, 2, 4, body);

  // Small tentacles emerging from opening
  for (let i = 0; i < 5; i++) {
    const ty = 12 + i * 2;
    grid[ty][27] = body;
    grid[ty][28] = accent;
    grid[ty][29] = body;
    if (i % 2 === 0) grid[ty][30] = accent;
  }

  // Small eye
  grid[14][26] = "#ffffff";
  grid[14][27] = "#000000";

  // Outline
  addOutline(grid, dark);

  return grid;
}

// ============================================================
// PUFFERFISH — Round and spiky when puffed, cute face
// ============================================================
export function drawPufferfish(palette) {
  const grid = emptyGrid();
  const { body, accent, dark, light } = palette;

  // Big round puffed body
  fillCircle(grid, 15, 15, 11, body);

  // Lighter belly (bottom half)
  fillEllipse(grid, 15, 19, 8, 5, light);

  // Spikes all around the body
  const spikePositions = [
    [15, 2], [8, 4], [22, 4],
    [4, 8], [26, 8],
    [3, 14], [27, 14],
    [4, 20], [26, 20],
    [8, 24], [22, 24],
    [12, 26], [18, 26],
    [15, 27],
  ];

  spikePositions.forEach(([sx, sy]) => {
    if (sx >= 0 && sx < 32 && sy >= 0 && sy < 32) {
      grid[sy][sx] = accent;
    }
    // Add a darker base to each spike
    const dx = sx < 15 ? 1 : sx > 15 ? -1 : 0;
    const dy = sy < 15 ? 1 : sy > 15 ? -1 : 0;
    const bx = sx + dx;
    const by = sy + dy;
    if (bx >= 0 && bx < 32 && by >= 0 && by < 32) {
      grid[by][bx] = dark;
    }
  });

  // Dorsal fin (top)
  grid[3][15] = accent;
  grid[3][16] = accent;
  grid[4][15] = body;

  // Side fins
  fillRect(grid, 3, 13, 2, 3, accent);
  fillRect(grid, 27, 13, 2, 3, accent);

  // Tail fin
  fillRect(grid, 14, 27, 3, 2, accent);
  grid[29][15] = body;

  // Mouth (small "o" shape)
  grid[18][14] = dark;
  grid[18][15] = dark;
  grid[19][13] = dark;
  grid[19][16] = dark;
  grid[20][14] = dark;
  grid[20][15] = dark;

  // Outline
  addOutline(grid, dark);

  return grid;
}

// ============================================================
// SPECIES MAP — Maps species name to drawing function
// ============================================================
export const SPECIES_DRAW_MAP = {
  lobster: drawLobster,
  squid: drawSquid,
  octopus: drawOctopus,
  shrimp: drawShrimp,
  hermitCrab: drawHermitCrab,
  nautilus: drawNautilus,
  pufferfish: drawPufferfish,
};
