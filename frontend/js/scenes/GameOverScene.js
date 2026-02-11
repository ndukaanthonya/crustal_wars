// scenes/GameOverScene.js
// Displays the match results after the player dies.
// Shows: score, kills, level reached, survival time, max combo.
// Buttons: Play Again, Back to Menu.

import Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  /**
   * @param {object} data - { summary: { score, kills, killsByType, level, survivalTime, maxCombo } }
   */
  init(data) {
    this.summary = data.summary || {
      score: 0,
      kills: 0,
      killsByType: { crab: 0, eel: 0, lavafish: 0 },
      level: 1,
      survivalTime: 0,
      maxCombo: 0,
    };
  }

  create() {
    const cx = this.cameras.main.width / 2;
    const s = this.summary;

    this.cameras.main.setBackgroundColor("#0a0e1a");

    // === GAME OVER TITLE ===
    this.add.text(cx, 50, "GAME OVER", {
      fontSize: "36px",
      fontFamily: "Courier New",
      color: "#ff4444",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // === SCORE (big, prominent) ===
    this.add.text(cx, 110, `SCORE: ${s.score}`, {
      fontSize: "28px",
      fontFamily: "Courier New",
      color: "#00ffcc",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // === STATS BLOCK ===
    const statsStartY = 170;
    const lineHeight = 28;
    const statsStyle = {
      fontSize: "14px",
      fontFamily: "Courier New",
      color: "#aabbcc",
    };
    const valueStyle = {
      fontSize: "14px",
      fontFamily: "Courier New",
      color: "#ffffff",
      fontStyle: "bold",
    };

    const stats = [
      { label: "Level Reached", value: s.level },
      { label: "Total Kills", value: s.kills },
      { label: "Survival Time", value: `${s.survivalTime}s` },
      { label: "Max Combo", value: `${s.maxCombo}x` },
    ];

    stats.forEach((stat, i) => {
      const y = statsStartY + i * lineHeight;
      this.add.text(cx - 120, y, stat.label, statsStyle);
      this.add.text(cx + 120, y, stat.value.toString(), valueStyle).setOrigin(1, 0);
    });

    // === KILL BREAKDOWN ===
    const breakdownY = statsStartY + stats.length * lineHeight + 20;

    this.add.text(cx, breakdownY, "— Kill Breakdown —", {
      fontSize: "12px",
      fontFamily: "Courier New",
      color: "#4a6a8a",
    }).setOrigin(0.5);

    const killStats = [
      { label: "🦀 Crabs", value: s.killsByType.crab, color: "#cc4444" },
      { label: "🐍 Eels", value: s.killsByType.eel, color: "#44aacc" },
      { label: "🔥 Lava Fish", value: s.killsByType.lavafish, color: "#ff6633" },
    ];

    killStats.forEach((ks, i) => {
      const y = breakdownY + 24 + i * 24;
      this.add.text(cx - 80, y, ks.label, {
        ...statsStyle, color: ks.color
      });
      this.add.text(cx + 80, y, ks.value.toString(), valueStyle).setOrigin(1, 0);
    });

    // === PERFORMANCE RATING ===
    const ratingY = breakdownY + 24 + killStats.length * 24 + 20;
    const rating = this.getPerformanceRating(s);

    this.add.text(cx, ratingY, rating.text, {
      fontSize: "18px",
      fontFamily: "Courier New",
      color: rating.color,
      fontStyle: "bold",
    }).setOrigin(0.5);

    // === BUTTONS ===
    const buttonY = 500;

    // Play Again button
    const playBg = this.add.rectangle(cx - 110, buttonY, 180, 44, 0x00ffcc).setInteractive();
    const playText = this.add.text(cx - 110, buttonY, "PLAY AGAIN", {
      fontSize: "14px",
      fontFamily: "Courier New",
      color: "#0a0e1a",
      fontStyle: "bold",
    }).setOrigin(0.5);

    playBg.on("pointerover", () => { playBg.setFillStyle(0x00eebb); playBg.setScale(1.05); playText.setScale(1.05); });
    playBg.on("pointerout", () => { playBg.setFillStyle(0x00ffcc); playBg.setScale(1); playText.setScale(1); });
    playBg.on("pointerdown", () => this.scene.start("GameScene"));

    // Menu button
    const menuBg = this.add.rectangle(cx + 110, buttonY, 180, 44, 0x1a3a5a).setInteractive();
    menuBg.setStrokeStyle(2, 0x4a6a8a);
    const menuText = this.add.text(cx + 110, buttonY, "MAIN MENU", {
      fontSize: "14px",
      fontFamily: "Courier New",
      color: "#aabbcc",
      fontStyle: "bold",
    }).setOrigin(0.5);

    menuBg.on("pointerover", () => { menuBg.setFillStyle(0x2a4a6a); menuBg.setScale(1.05); menuText.setScale(1.05); });
    menuBg.on("pointerout", () => { menuBg.setFillStyle(0x1a3a5a); menuBg.setScale(1); menuText.setScale(1); });
    menuBg.on("pointerdown", () => this.scene.start("MenuScene"));

    // === KEYBOARD SHORTCUTS ===
    this.input.keyboard.on("keydown-ENTER", () => this.scene.start("GameScene"));
    this.input.keyboard.on("keydown-SPACE", () => this.scene.start("GameScene"));
    this.input.keyboard.on("keydown-ESC", () => this.scene.start("MenuScene"));

    // === HINT ===
    this.add.text(cx, 560, "Enter / Space = Play Again   |   Esc = Menu", {
      fontSize: "9px",
      fontFamily: "Courier New",
      color: "#3a4a5a",
    }).setOrigin(0.5);
  }

  /**
   * Calculate a performance rating based on stats.
   */
  getPerformanceRating(s) {
    const score = s.score;

    if (score >= 1000) return { text: "⚡ LEGENDARY ⚡", color: "#ffd700" };
    if (score >= 500) return { text: "🔥 BEAST MODE", color: "#ff6633" };
    if (score >= 250) return { text: "💪 WARRIOR", color: "#00ffcc" };
    if (score >= 100) return { text: "👊 FIGHTER", color: "#44aacc" };
    if (score >= 50) return { text: "🌊 SURVIVOR", color: "#6688aa" };
    return { text: "🐚 ROOKIE", color: "#555555" };
  }
}
