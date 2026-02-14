// scenes/GameOverScene.js
// Match results — score, kills, rewards, performance rating.

import Phaser from "phaser";
import { DIFFICULTY_MODES } from "./MenuScene.js";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  init(data) {
    this.summary = data.summary || {
      score: 0, kills: 0, killsByType: { crab: 0, eel: 0, lavafish: 0 },
      level: 1, survivalTime: 0, maxCombo: 0, rewardMultiplier: 1, rewardPoints: 0,
    };
    this.difficultyMode = data.difficulty || "medium";
  }

  create() {
    const cx = this.cameras.main.width / 2;
    const s = this.summary;
    const modeConfig = DIFFICULTY_MODES[this.difficultyMode] || DIFFICULTY_MODES.medium;

    this.cameras.main.setBackgroundColor("#0a0e1a");

    // === GAME OVER ===
    this.add.text(cx, 35, "GAME OVER", {
      fontSize: "32px", fontFamily: "Courier New", color: "#ff4444", fontStyle: "bold",
    }).setOrigin(0.5);

    // Difficulty mode played
    this.add.text(cx, 65, `${modeConfig.label} MODE`, {
      fontSize: "11px", fontFamily: "Courier New", color: modeConfig.color,
    }).setOrigin(0.5);

    // === SCORE ===
    this.add.text(cx, 100, `SCORE: ${s.score}`, {
      fontSize: "26px", fontFamily: "Courier New", color: "#00ffcc", fontStyle: "bold",
    }).setOrigin(0.5);

    // === REWARD POINTS (the big number that matters for $CRUST) ===
    this.add.text(cx, 135, `$CRUST REWARD: ${s.rewardPoints} pts`, {
      fontSize: "16px", fontFamily: "Courier New", color: "#ffd700", fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(cx, 155, `(Score × ${s.rewardMultiplier}x ${modeConfig.label} bonus)`, {
      fontSize: "9px", fontFamily: "Courier New", color: "#8a7a5a",
    }).setOrigin(0.5);

    // === STATS ===
    const sy = 185;
    const lh = 24;
    const ls = { fontSize: "12px", fontFamily: "Courier New", color: "#aabbcc" };
    const vs = { fontSize: "12px", fontFamily: "Courier New", color: "#ffffff", fontStyle: "bold" };

    const stats = [
      { label: "Level Reached", value: s.level },
      { label: "Total Kills", value: s.kills },
      { label: "Survival Time", value: `${s.survivalTime}s` },
      { label: "Max Combo", value: `${s.maxCombo}x` },
    ];

    stats.forEach((stat, i) => {
      this.add.text(cx - 100, sy + i * lh, stat.label, ls);
      this.add.text(cx + 100, sy + i * lh, stat.value.toString(), vs).setOrigin(1, 0);
    });

    // === KILL BREAKDOWN ===
    const by = sy + stats.length * lh + 14;
    this.add.text(cx, by, "— Kill Breakdown —", {
      fontSize: "10px", fontFamily: "Courier New", color: "#4a6a8a",
    }).setOrigin(0.5);

    const kills = [
      { label: "🦀 Crabs", value: s.killsByType.crab, color: "#cc4444" },
      { label: "🐍 Eels", value: s.killsByType.eel, color: "#44aacc" },
      { label: "🔥 Lava Fish", value: s.killsByType.lavafish, color: "#ff6633" },
    ];

    kills.forEach((k, i) => {
      this.add.text(cx - 70, by + 18 + i * 20, k.label, { ...ls, color: k.color });
      this.add.text(cx + 70, by + 18 + i * 20, k.value.toString(), vs).setOrigin(1, 0);
    });

    // === PERFORMANCE RATING ===
    const ry = by + 18 + kills.length * 20 + 14;
    const rating = this.getRating(s);
    this.add.text(cx, ry, rating.text, {
      fontSize: "16px", fontFamily: "Courier New", color: rating.color, fontStyle: "bold",
    }).setOrigin(0.5);

    // === BUTTONS ===
    const btnY = 500;

    // Play Again
    const playBg = this.add.rectangle(cx - 130, btnY, 160, 40, 0x00ffcc).setInteractive({ useHandCursor: true });
    this.add.text(cx - 130, btnY, "PLAY AGAIN", {
      fontSize: "12px", fontFamily: "Courier New", color: "#0a0e1a", fontStyle: "bold",
    }).setOrigin(0.5);
    playBg.on("pointerover", () => playBg.setFillStyle(0x00eebb));
    playBg.on("pointerout", () => playBg.setFillStyle(0x00ffcc));
    playBg.on("pointerdown", () => this.scene.start("GameScene", { difficulty: this.difficultyMode }));

    // Leaderboard
    const lbBg = this.add.rectangle(cx, btnY, 160, 40, 0x1a3a5a).setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x3498db);
    this.add.text(cx, btnY, "LEADERBOARD", {
      fontSize: "12px", fontFamily: "Courier New", color: "#3498db", fontStyle: "bold",
    }).setOrigin(0.5);
    lbBg.on("pointerover", () => lbBg.setFillStyle(0x222e3e));
    lbBg.on("pointerout", () => lbBg.setFillStyle(0x1a3a5a));
    lbBg.on("pointerdown", () => this.scene.start("LeaderboardScene", { tab: "global" }));

    // Menu
    const menuBg = this.add.rectangle(cx + 130, btnY, 160, 40, 0x1a3a5a).setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x4a6a8a);
    this.add.text(cx + 130, btnY, "MENU", {
      fontSize: "12px", fontFamily: "Courier New", color: "#aabbcc", fontStyle: "bold",
    }).setOrigin(0.5);
    menuBg.on("pointerover", () => menuBg.setFillStyle(0x222e3e));
    menuBg.on("pointerout", () => menuBg.setFillStyle(0x1a3a5a));
    menuBg.on("pointerdown", () => this.scene.start("MenuScene"));

    // Keyboard shortcuts
    this.input.keyboard.on("keydown-ENTER", () => this.scene.start("GameScene", { difficulty: this.difficultyMode }));
    this.input.keyboard.on("keydown-ESC", () => this.scene.start("MenuScene"));

    this.add.text(cx, 555, "Enter = Replay  |  Esc = Menu", {
      fontSize: "8px", fontFamily: "Courier New", color: "#3a4a5a",
    }).setOrigin(0.5);
  }

  getRating(s) {
    const score = s.rewardPoints; // Rate based on reward points
    if (score >= 2000) return { text: "⚡ LEGENDARY ⚡", color: "#ffd700" };
    if (score >= 1000) return { text: "🔥 BEAST MODE", color: "#ff6633" };
    if (score >= 500) return { text: "💪 WARRIOR", color: "#00ffcc" };
    if (score >= 200) return { text: "👊 FIGHTER", color: "#44aacc" };
    if (score >= 50) return { text: "🌊 SURVIVOR", color: "#6688aa" };
    return { text: "🐚 ROOKIE", color: "#555555" };
  }
}
