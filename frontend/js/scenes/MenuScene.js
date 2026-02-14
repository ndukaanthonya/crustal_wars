// scenes/MenuScene.js
// Main menu — Genesis Warriors progress bar, difficulty selector,
// navigation to leaderboards, and Play button.

import Phaser from "phaser";

// === DIFFICULTY MODES ===
// Each mode scales enemy stats and rewards differently
export const DIFFICULTY_MODES = {
  easy: {
    label: "EASY",
    color: "#44cc66",
    description: "Chill vibes. Fewer enemies, slower pace.",
    enemyMultiplier: 0.6,
    speedMultiplier: 0.7,
    spawnMultiplier: 0.6,
    rewardMultiplier: 0.5,
    rewardLabel: "0.5x Rewards",
  },
  medium: {
    label: "MEDIUM",
    color: "#ffcc00",
    description: "Balanced challenge. Standard rewards.",
    enemyMultiplier: 1.0,
    speedMultiplier: 1.0,
    spawnMultiplier: 1.0,
    rewardMultiplier: 1.0,
    rewardLabel: "1x Rewards",
  },
  hard: {
    label: "HARD",
    color: "#ff6633",
    description: "Intense. More enemies, faster attacks.",
    enemyMultiplier: 1.5,
    speedMultiplier: 1.3,
    spawnMultiplier: 1.4,
    rewardMultiplier: 2.0,
    rewardLabel: "2x Rewards",
  },
  crazy: {
    label: "CRAZY HARD",
    color: "#ff0044",
    description: "ABSOLUTE CHAOS. Insane spawns. Huge rewards.",
    enemyMultiplier: 2.5,
    speedMultiplier: 1.8,
    spawnMultiplier: 2.0,
    rewardMultiplier: 5.0,
    rewardLabel: "5x Rewards",
  },
};

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const cx = this.cameras.main.width / 2;
    this.cameras.main.setBackgroundColor("#0a0e1a");

    // Track selected difficulty
    this.selectedDifficulty = "medium";
    this.difficultyButtons = {};

    // === TITLE ===
    this.add.text(cx, 30, "CRUSTAL WARS", {
      fontSize: "34px",
      fontFamily: "Courier New",
      color: "#00ffcc",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(cx, 60, "Play-to-Earn Arena Shooter", {
      fontSize: "11px",
      fontFamily: "Courier New",
      color: "#4a6a8a",
    }).setOrigin(0.5);

    // === GENESIS WARRIORS PROGRESS BAR ===
    this.createGenesisBar(cx, 100);

    // === ANIMATED CREATURES ===
    const crab = this.add.image(cx - 100, 160, "crab").setScale(2.5);
    const eel = this.add.image(cx, 160, "eel").setScale(2.5);
    const lava = this.add.image(cx + 100, 160, "lavafish").setScale(2.5);

    this.tweens.add({ targets: crab, y: 155, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    this.tweens.add({ targets: eel, y: 152, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: 300 });
    this.tweens.add({ targets: lava, y: 157, duration: 1800, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: 600 });

    // === DIFFICULTY SELECTOR ===
    this.add.text(cx, 200, "— SELECT DIFFICULTY —", {
      fontSize: "10px",
      fontFamily: "Courier New",
      color: "#4a6a8a",
      letterSpacing: 3,
    }).setOrigin(0.5);

    this.createDifficultySelector(cx, 240);

    // === DIFFICULTY DESCRIPTION (updates when selection changes) ===
    this.diffDescription = this.add.text(cx, 295, DIFFICULTY_MODES.medium.description, {
      fontSize: "10px",
      fontFamily: "Courier New",
      color: "#6688aa",
    }).setOrigin(0.5);

    this.diffReward = this.add.text(cx, 312, DIFFICULTY_MODES.medium.rewardLabel, {
      fontSize: "12px",
      fontFamily: "Courier New",
      color: "#ffcc00",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // === PLAY BUTTON ===
    const playBtnY = 365;
    const playBg = this.add.rectangle(cx, playBtnY, 220, 50, 0x00ffcc).setInteractive({ useHandCursor: true });
    const playText = this.add.text(cx, playBtnY, "PLAY", {
      fontSize: "24px",
      fontFamily: "Courier New",
      color: "#0a0e1a",
      fontStyle: "bold",
    }).setOrigin(0.5);

    playBg.on("pointerover", () => { playBg.setFillStyle(0x00eebb); playBg.setScale(1.05); playText.setScale(1.05); });
    playBg.on("pointerout", () => { playBg.setFillStyle(0x00ffcc); playBg.setScale(1); playText.setScale(1); });
    playBg.on("pointerdown", () => {
      this.scene.start("GameScene", { difficulty: this.selectedDifficulty });
    });

    // === NAV BUTTONS (Leaderboard) ===
    const navY = 430;

    // Global Leaderboard button
    this.createNavButton(cx - 110, navY, "LEADERBOARD", "#3498db", () => {
      this.scene.start("LeaderboardScene", { tab: "global" });
    });

    // Team Leaderboard button
    this.createNavButton(cx + 110, navY, "TEAMS", "#9b59b6", () => {
      this.scene.start("LeaderboardScene", { tab: "teams" });
    });

    // === CONTROLS HELP ===
    this.add.text(cx, 490, "WASD = Move  |  Mouse = Aim & Shoot  |  Space = Melee", {
      fontSize: "9px",
      fontFamily: "Courier New",
      color: "#3a5a7a",
    }).setOrigin(0.5);

    this.add.text(cx, 508, "Survive 90-second rounds. Kill enemies. Climb the leaderboard.", {
      fontSize: "9px",
      fontFamily: "Courier New",
      color: "#3a5a7a",
    }).setOrigin(0.5);

    // === KEYBOARD SHORTCUTS ===
    this.input.keyboard.on("keydown-ENTER", () => {
      this.scene.start("GameScene", { difficulty: this.selectedDifficulty });
    });
  }

  // ============================================================
  // GENESIS WARRIORS PROGRESS BAR
  // ============================================================
  createGenesisBar(cx, y) {
    // Mock data — later this reads from PlayerRegistry.sol on-chain
    const genesisJoined = 743;
    const genesisMax = 1000;
    const percent = genesisJoined / genesisMax;

    // Label
    this.add.text(cx, y - 12, "GENESIS WARRIORS", {
      fontSize: "9px",
      fontFamily: "Courier New",
      color: "#ffd700",
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Bar background
    const barWidth = 300;
    const barHeight = 18;
    const barX = cx - barWidth / 2;

    this.add.rectangle(cx, y + 8, barWidth + 4, barHeight + 4, 0x1a2a3a).setOrigin(0.5);
    this.add.rectangle(cx, y + 8, barWidth, barHeight, 0x0d1520).setOrigin(0.5);

    // Filled portion (golden gradient feel)
    const fillWidth = barWidth * percent;
    const fill = this.add.rectangle(
      barX + 2 + fillWidth / 2, y + 8,
      fillWidth, barHeight - 4, 0xffd700
    ).setOrigin(0.5);

    // Shimmer animation on the bar
    this.tweens.add({
      targets: fill,
      alpha: 0.7,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Counter text
    this.add.text(cx, y + 8, `${genesisJoined} / ${genesisMax}`, {
      fontSize: "10px",
      fontFamily: "Courier New",
      color: "#0a0e1a",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Spots remaining
    const remaining = genesisMax - genesisJoined;
    this.add.text(cx, y + 26, `${remaining} spots remaining — Join now for bonus $CRUST!`, {
      fontSize: "8px",
      fontFamily: "Courier New",
      color: "#b8860b",
    }).setOrigin(0.5);
  }

  // ============================================================
  // DIFFICULTY SELECTOR — 4 buttons in a row
  // ============================================================
  createDifficultySelector(cx, y) {
    const modes = ["easy", "medium", "hard", "crazy"];
    const buttonWidth = 100;
    const gap = 8;
    const totalWidth = modes.length * buttonWidth + (modes.length - 1) * gap;
    const startX = cx - totalWidth / 2 + buttonWidth / 2;

    modes.forEach((mode, i) => {
      const config = DIFFICULTY_MODES[mode];
      const bx = startX + i * (buttonWidth + gap);

      // Button background
      const bg = this.add.rectangle(bx, y, buttonWidth, 36, 0x1a2a3a)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(config.color).color, 0.5);

      // Button label
      const label = this.add.text(bx, y - 4, config.label, {
        fontSize: mode === "crazy" ? "8px" : "10px",
        fontFamily: "Courier New",
        color: config.color,
        fontStyle: "bold",
      }).setOrigin(0.5);

      // Reward indicator
      const reward = this.add.text(bx, y + 10, config.rewardLabel, {
        fontSize: "7px",
        fontFamily: "Courier New",
        color: "#6a7a8a",
      }).setOrigin(0.5);

      // Store references for highlighting
      this.difficultyButtons[mode] = { bg, label, reward };

      // Click handler
      bg.on("pointerdown", () => {
        this.selectDifficulty(mode);
      });

      bg.on("pointerover", () => {
        if (this.selectedDifficulty !== mode) {
          bg.setFillStyle(0x222e3e);
        }
      });

      bg.on("pointerout", () => {
        if (this.selectedDifficulty !== mode) {
          bg.setFillStyle(0x1a2a3a);
        }
      });
    });

    // Highlight default selection
    this.highlightDifficulty("medium");
  }

  /**
   * Select a difficulty mode and update visuals.
   */
  selectDifficulty(mode) {
    this.selectedDifficulty = mode;
    const config = DIFFICULTY_MODES[mode];

    // Update description
    this.diffDescription.setText(config.description);
    this.diffReward.setText(config.rewardLabel);
    this.diffReward.setColor(config.color);

    this.highlightDifficulty(mode);
  }

  /**
   * Highlight the selected difficulty button and dim others.
   */
  highlightDifficulty(activeMode) {
    Object.entries(this.difficultyButtons).forEach(([mode, btn]) => {
      const config = DIFFICULTY_MODES[mode];
      if (mode === activeMode) {
        btn.bg.setFillStyle(Phaser.Display.Color.HexStringToColor(config.color).color);
        btn.bg.setAlpha(0.3);
        btn.bg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(config.color).color, 1);
        btn.label.setColor("#ffffff");
        btn.reward.setColor("#ffffff");
      } else {
        btn.bg.setFillStyle(0x1a2a3a);
        btn.bg.setAlpha(1);
        btn.bg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(config.color).color, 0.3);
        btn.label.setColor(config.color);
        btn.reward.setColor("#6a7a8a");
      }
    });
  }

  // ============================================================
  // NAV BUTTON HELPER
  // ============================================================
  createNavButton(x, y, text, color, callback) {
    const bg = this.add.rectangle(x, y, 180, 36, 0x1a2a3a)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color, 0.6);

    const label = this.add.text(x, y, text, {
      fontSize: "11px",
      fontFamily: "Courier New",
      color: color,
      fontStyle: "bold",
    }).setOrigin(0.5);

    bg.on("pointerover", () => { bg.setFillStyle(0x222e3e); label.setColor("#ffffff"); });
    bg.on("pointerout", () => { bg.setFillStyle(0x1a2a3a); label.setColor(color); });
    bg.on("pointerdown", callback);
  }
}
