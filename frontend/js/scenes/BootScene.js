// scenes/BootScene.js
// The first scene that loads — displays a message to prove Phaser is working.

import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // Nothing to load yet
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Game title
    this.add.text(centerX, centerY - 60, "CRUSTAL WARS", {
      fontSize: "36px",
      fontFamily: "Courier New",
      color: "#00ffcc",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, centerY + 10, "Play-to-Earn Arena Shooter", {
      fontSize: "18px",
      fontFamily: "Courier New",
      color: "#6688aa",
    }).setOrigin(0.5);

    // Setup confirmation
    this.add.text(centerX, centerY + 60, "Phaser is running!", {
      fontSize: "16px",
      fontFamily: "Courier New",
      color: "#44ff44",
    }).setOrigin(0.5);

    // Phase indicator
    this.add.text(centerX, centerY + 120, "[ Phase 1 Setup Complete ]", {
      fontSize: "14px",
      fontFamily: "Courier New",
      color: "#555555",
    }).setOrigin(0.5);
  }
}
