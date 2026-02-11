// scenes/MenuScene.js
// Main menu screen — shows game title and a "Play" button.
// Later this will include wallet connection and onboarding flow.

import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    // Background color
    this.cameras.main.setBackgroundColor("#0a0e1a");

    // === TITLE ===
    this.add.text(cx, cy - 140, "CRUSTAL WARS", {
      fontSize: "40px",
      fontFamily: "Courier New",
      color: "#00ffcc",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy - 95, "Play-to-Earn Arena Shooter", {
      fontSize: "14px",
      fontFamily: "Courier New",
      color: "#4a6a8a",
    }).setOrigin(0.5);

    // === ANIMATED DECORATIVE CREATURES ===
    const crab = this.add.image(cx - 100, cy - 20, "crab").setScale(3);
    const eel = this.add.image(cx, cy - 20, "eel").setScale(3);
    const lava = this.add.image(cx + 100, cy - 20, "lavafish").setScale(3);

    // Gentle floating animation
    this.tweens.add({
      targets: crab,
      y: cy - 25,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: eel,
      y: cy - 28,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      delay: 300,
    });
    this.tweens.add({
      targets: lava,
      y: cy - 22,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      delay: 600,
    });

    // === PLAY BUTTON ===
    const btnBg = this.add.rectangle(cx, cy + 80, 200, 50, 0x00ffcc).setInteractive();
    const btnText = this.add.text(cx, cy + 80, "PLAY", {
      fontSize: "22px",
      fontFamily: "Courier New",
      color: "#0a0e1a",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Button hover effects
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x00eebb);
      btnBg.setScale(1.05);
      btnText.setScale(1.05);
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x00ffcc);
      btnBg.setScale(1);
      btnText.setScale(1);
    });

    // Click to start game
    btnBg.on("pointerdown", () => {
      this.scene.start("GameScene");
    });

    // === CONTROLS HELP ===
    this.add.text(cx, cy + 150, "WASD / Arrows = Move   |   Click = Shoot   |   Space = Melee", {
      fontSize: "10px",
      fontFamily: "Courier New",
      color: "#3a5a7a",
    }).setOrigin(0.5);

    this.add.text(cx, cy + 170, "Survive 90 seconds. Kill enemies. Reach the highest level.", {
      fontSize: "10px",
      fontFamily: "Courier New",
      color: "#3a5a7a",
    }).setOrigin(0.5);

    // === PRESS ENTER TO START (keyboard shortcut) ===
    this.input.keyboard.on("keydown-ENTER", () => {
      this.scene.start("GameScene");
    });
    this.input.keyboard.on("keydown-SPACE", () => {
      this.scene.start("GameScene");
    });
  }
}
