// scenes/BootScene.js
// Generates all game textures from code (colored rectangles/circles).
// This means we don't need any sprite image files to get the game working.
// Later, we'll swap these with real pixel art sprites.

import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // Show a simple loading message
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;
    this.add.text(cx, cy, "Loading...", {
      fontSize: "20px",
      fontFamily: "Courier New",
      color: "#00ffcc",
    }).setOrigin(0.5);
  }

  create() {
    // === GENERATE TEXTURES FROM CODE ===
    // We draw simple shapes onto Phaser textures so we can use them as sprites.
    // This replaces the need for image files during development.

    // --- PLAYER ---
    // Body: small teal rectangle (16x20)
    const playerGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Body
    playerGfx.fillStyle(0x00ccaa, 1);
    playerGfx.fillRect(4, 12, 16, 20);
    // Head (large — the NFT avatar head)
    playerGfx.fillStyle(0x00ffcc, 1);
    playerGfx.fillRect(0, 0, 24, 16);
    // Eyes
    playerGfx.fillStyle(0xffffff, 1);
    playerGfx.fillRect(4, 4, 6, 5);
    playerGfx.fillRect(14, 4, 6, 5);
    playerGfx.fillStyle(0x000000, 1);
    playerGfx.fillRect(7, 5, 3, 3);
    playerGfx.fillRect(17, 5, 3, 3);
    playerGfx.generateTexture("player", 24, 32);
    playerGfx.destroy();

    // --- CRAB ENEMY (slow, tanky) ---
    const crabGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Shell
    crabGfx.fillStyle(0xcc4444, 1);
    crabGfx.fillRect(2, 4, 20, 14);
    // Claws
    crabGfx.fillStyle(0xee5555, 1);
    crabGfx.fillRect(0, 6, 4, 8);
    crabGfx.fillRect(20, 6, 4, 8);
    // Eyes on stalks
    crabGfx.fillStyle(0xffffff, 1);
    crabGfx.fillRect(6, 0, 4, 5);
    crabGfx.fillRect(14, 0, 4, 5);
    crabGfx.fillStyle(0x000000, 1);
    crabGfx.fillRect(7, 1, 2, 2);
    crabGfx.fillRect(15, 1, 2, 2);
    // Legs
    crabGfx.fillStyle(0xaa3333, 1);
    for (let i = 0; i < 3; i++) {
      crabGfx.fillRect(4 + i * 5, 18, 3, 4);
    }
    crabGfx.generateTexture("crab", 24, 22);
    crabGfx.destroy();

    // --- EEL ENEMY (fast, low health) ---
    const eelGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Long body
    eelGfx.fillStyle(0x44aacc, 1);
    eelGfx.fillRect(0, 6, 32, 8);
    // Head
    eelGfx.fillStyle(0x55ccee, 1);
    eelGfx.fillRect(24, 4, 8, 12);
    // Eye
    eelGfx.fillStyle(0xffffff, 1);
    eelGfx.fillRect(28, 6, 3, 3);
    eelGfx.fillStyle(0x000000, 1);
    eelGfx.fillRect(29, 7, 2, 2);
    // Tail fin
    eelGfx.fillStyle(0x3399aa, 1);
    eelGfx.fillRect(0, 4, 4, 12);
    eelGfx.generateTexture("eel", 32, 20);
    eelGfx.destroy();

    // --- LAVA FISH ENEMY (medium, shoots back) ---
    const lavaGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Body
    lavaGfx.fillStyle(0xff6633, 1);
    lavaGfx.fillRect(4, 4, 16, 16);
    // Fins
    lavaGfx.fillStyle(0xff4411, 1);
    lavaGfx.fillRect(0, 8, 6, 8);
    lavaGfx.fillRect(18, 2, 6, 6);
    // Tail
    lavaGfx.fillRect(0, 6, 4, 12);
    // Eye (angry)
    lavaGfx.fillStyle(0xffff00, 1);
    lavaGfx.fillRect(14, 6, 5, 4);
    lavaGfx.fillStyle(0xff0000, 1);
    lavaGfx.fillRect(16, 7, 2, 2);
    // Mouth
    lavaGfx.fillStyle(0xcc3300, 1);
    lavaGfx.fillRect(18, 14, 6, 3);
    lavaGfx.generateTexture("lavafish", 24, 24);
    lavaGfx.destroy();

    // --- PROJECTILES ---
    // Player bullet (bright cyan)
    const bulletGfx = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGfx.fillStyle(0x00ffcc, 1);
    bulletGfx.fillRect(0, 0, 8, 4);
    bulletGfx.fillStyle(0xffffff, 1);
    bulletGfx.fillRect(1, 1, 2, 2);
    bulletGfx.generateTexture("bullet", 8, 4);
    bulletGfx.destroy();

    // Enemy bullet (orange-red)
    const eBulletGfx = this.make.graphics({ x: 0, y: 0, add: false });
    eBulletGfx.fillStyle(0xff4422, 1);
    eBulletGfx.fillRect(0, 0, 6, 6);
    eBulletGfx.fillStyle(0xffaa00, 1);
    eBulletGfx.fillRect(1, 1, 4, 4);
    eBulletGfx.generateTexture("enemy-bullet", 6, 6);
    eBulletGfx.destroy();

    // --- MELEE SLASH EFFECT ---
    const slashGfx = this.make.graphics({ x: 0, y: 0, add: false });
    slashGfx.fillStyle(0xffffff, 0.8);
    slashGfx.fillRect(0, 0, 28, 28);
    slashGfx.fillStyle(0x00ffcc, 0.5);
    slashGfx.fillRect(4, 4, 20, 20);
    slashGfx.generateTexture("slash", 28, 28);
    slashGfx.destroy();

    // --- ARENA BORDER ---
    const borderGfx = this.make.graphics({ x: 0, y: 0, add: false });
    borderGfx.fillStyle(0x1a3a5a, 1);
    borderGfx.fillRect(0, 0, 4, 4);
    borderGfx.generateTexture("border-tile", 4, 4);
    borderGfx.destroy();

    // All textures generated — move to menu
    this.scene.start("MenuScene");
  }
}
