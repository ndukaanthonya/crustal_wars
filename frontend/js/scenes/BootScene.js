// scenes/BootScene.js
// Generates all game textures from code (no image files needed).
// Includes player, rifle, enemies, projectiles, and effects.

import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;
    this.add.text(cx, cy, "Loading...", {
      fontSize: "20px",
      fontFamily: "Courier New",
      color: "#00ffcc",
    }).setOrigin(0.5);
  }

  create() {
    // === PLAYER BODY (without weapon — weapon is a separate sprite) ===
    const playerGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Body
    playerGfx.fillStyle(0x00ccaa, 1);
    playerGfx.fillRect(4, 12, 16, 20);
    // Head (large NFT avatar head)
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

    // === PUMP-ACTION RIFLE ===
    // Drawn as a small pixel art rifle pointing right (rotation handled in code)
    const rifleGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Barrel (long dark tube)
    rifleGfx.fillStyle(0x555555, 1);
    rifleGfx.fillRect(8, 2, 22, 4);
    // Barrel tip / muzzle (lighter)
    rifleGfx.fillStyle(0x888888, 1);
    rifleGfx.fillRect(28, 1, 4, 6);
    // Muzzle flash point
    rifleGfx.fillStyle(0xaaaaaa, 1);
    rifleGfx.fillRect(30, 3, 2, 2);
    // Pump / foregrip
    rifleGfx.fillStyle(0x8B6914, 1);
    rifleGfx.fillRect(14, 1, 8, 6);
    // Receiver body
    rifleGfx.fillStyle(0x444444, 1);
    rifleGfx.fillRect(4, 1, 12, 6);
    // Stock (wooden)
    rifleGfx.fillStyle(0x6B4226, 1);
    rifleGfx.fillRect(0, 2, 6, 5);
    rifleGfx.fillStyle(0x5A3520, 1);
    rifleGfx.fillRect(0, 5, 4, 3);
    // Trigger guard
    rifleGfx.fillStyle(0x333333, 1);
    rifleGfx.fillRect(8, 6, 4, 3);
    // Small detail lines
    rifleGfx.fillStyle(0x666666, 1);
    rifleGfx.fillRect(20, 1, 1, 6);
    rifleGfx.fillRect(26, 2, 1, 4);
    rifleGfx.generateTexture("rifle", 32, 10);
    rifleGfx.destroy();

    // === MUZZLE FLASH EFFECT ===
    const flashGfx = this.make.graphics({ x: 0, y: 0, add: false });
    flashGfx.fillStyle(0xffff88, 1);
    flashGfx.fillRect(0, 2, 10, 4);
    flashGfx.fillStyle(0xffffcc, 1);
    flashGfx.fillRect(2, 0, 6, 8);
    flashGfx.fillStyle(0xffffff, 1);
    flashGfx.fillRect(3, 3, 4, 2);
    flashGfx.generateTexture("muzzle-flash", 10, 8);
    flashGfx.destroy();

    // === CRAB ENEMY ===
    const crabGfx = this.make.graphics({ x: 0, y: 0, add: false });
    crabGfx.fillStyle(0xcc4444, 1);
    crabGfx.fillRect(2, 4, 20, 14);
    crabGfx.fillStyle(0xee5555, 1);
    crabGfx.fillRect(0, 6, 4, 8);
    crabGfx.fillRect(20, 6, 4, 8);
    crabGfx.fillStyle(0xffffff, 1);
    crabGfx.fillRect(6, 0, 4, 5);
    crabGfx.fillRect(14, 0, 4, 5);
    crabGfx.fillStyle(0x000000, 1);
    crabGfx.fillRect(7, 1, 2, 2);
    crabGfx.fillRect(15, 1, 2, 2);
    crabGfx.fillStyle(0xaa3333, 1);
    for (let i = 0; i < 3; i++) {
      crabGfx.fillRect(4 + i * 5, 18, 3, 4);
    }
    crabGfx.generateTexture("crab", 24, 22);
    crabGfx.destroy();

    // === EEL ENEMY ===
    const eelGfx = this.make.graphics({ x: 0, y: 0, add: false });
    eelGfx.fillStyle(0x44aacc, 1);
    eelGfx.fillRect(0, 6, 32, 8);
    eelGfx.fillStyle(0x55ccee, 1);
    eelGfx.fillRect(24, 4, 8, 12);
    eelGfx.fillStyle(0xffffff, 1);
    eelGfx.fillRect(28, 6, 3, 3);
    eelGfx.fillStyle(0x000000, 1);
    eelGfx.fillRect(29, 7, 2, 2);
    eelGfx.fillStyle(0x3399aa, 1);
    eelGfx.fillRect(0, 4, 4, 12);
    eelGfx.generateTexture("eel", 32, 20);
    eelGfx.destroy();

    // === LAVA FISH ENEMY ===
    const lavaGfx = this.make.graphics({ x: 0, y: 0, add: false });
    lavaGfx.fillStyle(0xff6633, 1);
    lavaGfx.fillRect(4, 4, 16, 16);
    lavaGfx.fillStyle(0xff4411, 1);
    lavaGfx.fillRect(0, 8, 6, 8);
    lavaGfx.fillRect(18, 2, 6, 6);
    lavaGfx.fillRect(0, 6, 4, 12);
    lavaGfx.fillStyle(0xffff00, 1);
    lavaGfx.fillRect(14, 6, 5, 4);
    lavaGfx.fillStyle(0xff0000, 1);
    lavaGfx.fillRect(16, 7, 2, 2);
    lavaGfx.fillStyle(0xcc3300, 1);
    lavaGfx.fillRect(18, 14, 6, 3);
    lavaGfx.generateTexture("lavafish", 24, 24);
    lavaGfx.destroy();

    // === PROJECTILES ===
    // Player laser bullet (bright cyan beam)
    const bulletGfx = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGfx.fillStyle(0x00ffcc, 1);
    bulletGfx.fillRect(0, 1, 10, 2);
    bulletGfx.fillStyle(0xffffff, 1);
    bulletGfx.fillRect(1, 1, 4, 2);
    bulletGfx.fillStyle(0x00ffcc, 0.5);
    bulletGfx.fillRect(0, 0, 10, 4);
    bulletGfx.generateTexture("bullet", 10, 4);
    bulletGfx.destroy();

    // Enemy bullet (orange-red fireball)
    const eBulletGfx = this.make.graphics({ x: 0, y: 0, add: false });
    eBulletGfx.fillStyle(0xff4422, 1);
    eBulletGfx.fillRect(0, 0, 6, 6);
    eBulletGfx.fillStyle(0xffaa00, 1);
    eBulletGfx.fillRect(1, 1, 4, 4);
    eBulletGfx.generateTexture("enemy-bullet", 6, 6);
    eBulletGfx.destroy();

    // === MELEE SLASH ===
    const slashGfx = this.make.graphics({ x: 0, y: 0, add: false });
    slashGfx.fillStyle(0xffffff, 0.8);
    slashGfx.fillRect(0, 0, 28, 28);
    slashGfx.fillStyle(0x00ffcc, 0.5);
    slashGfx.fillRect(4, 4, 20, 20);
    slashGfx.generateTexture("slash", 28, 28);
    slashGfx.destroy();

    // === CROSSHAIR ===
    const crossGfx = this.make.graphics({ x: 0, y: 0, add: false });
    crossGfx.lineStyle(1, 0xff3333, 0.8);
    crossGfx.strokeCircle(8, 8, 6);
    crossGfx.lineBetween(8, 0, 8, 4);
    crossGfx.lineBetween(8, 12, 8, 16);
    crossGfx.lineBetween(0, 8, 4, 8);
    crossGfx.lineBetween(12, 8, 16, 8);
    crossGfx.fillStyle(0xff3333, 1);
    crossGfx.fillRect(7, 7, 2, 2);
    crossGfx.generateTexture("crosshair", 16, 16);
    crossGfx.destroy();

    // All textures generated — go to menu
    this.scene.start("MenuScene");
  }
}
