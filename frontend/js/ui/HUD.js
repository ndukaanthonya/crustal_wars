// ui/HUD.js
// In-game heads-up display — shows health bar, score, timer, level, and combo.
// Rendered as Phaser text and graphics overlaid on the game.

import Phaser from "phaser";

export default class HUD {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;

    // All HUD elements are at a high depth so they render above gameplay
    const depth = 100;
    const textStyle = {
      fontSize: "14px",
      fontFamily: "Courier New",
      color: "#d0d8e8",
    };

    // === TOP-LEFT: Health bar ===
    this.healthBarBg = scene.add.rectangle(120, 20, 200, 16, 0x1a2a3a).setDepth(depth);
    this.healthBar = scene.add.rectangle(120, 20, 200, 16, 0x00ff88).setDepth(depth + 1);
    this.healthBar.setOrigin(0.5, 0.5);
    this.healthLabel = scene.add.text(14, 12, "HP", {
      ...textStyle, fontSize: "12px", color: "#00ff88"
    }).setDepth(depth + 1);

    // === TOP-CENTER: Timer ===
    this.timerText = scene.add.text(400, 10, "90", {
      fontSize: "28px",
      fontFamily: "Courier New",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5, 0).setDepth(depth);

    this.timerLabel = scene.add.text(400, 38, "SECONDS", {
      fontSize: "8px",
      fontFamily: "Courier New",
      color: "#4a6a8a",
    }).setOrigin(0.5, 0).setDepth(depth);

    // === TOP-RIGHT: Score & Level ===
    this.scoreText = scene.add.text(786, 10, "SCORE: 0", {
      ...textStyle, fontSize: "14px", fontStyle: "bold"
    }).setOrigin(1, 0).setDepth(depth);

    this.levelText = scene.add.text(786, 28, "LEVEL 1", {
      ...textStyle, fontSize: "12px", color: "#00ffcc"
    }).setOrigin(1, 0).setDepth(depth);

    // === COMBO DISPLAY (center, appears on kills) ===
    this.comboText = scene.add.text(400, 80, "", {
      fontSize: "20px",
      fontFamily: "Courier New",
      color: "#ffcc00",
      fontStyle: "bold",
    }).setOrigin(0.5, 0.5).setDepth(depth).setAlpha(0);

    // === LEVEL-UP BANNER ===
    this.levelUpText = scene.add.text(400, 300, "", {
      fontSize: "32px",
      fontFamily: "Courier New",
      color: "#00ffcc",
      fontStyle: "bold",
    }).setOrigin(0.5, 0.5).setDepth(depth + 5).setAlpha(0);

    // === WEAPON INDICATOR (bottom-left) ===
    this.weaponText = scene.add.text(14, 576, "🔫 Ranged: Click  |  ⚔️ Melee: Space", {
      fontSize: "10px",
      fontFamily: "Courier New",
      color: "#3a5a7a",
    }).setDepth(depth);

    // === ENEMIES REMAINING (bottom-right) ===
    this.enemyCountText = scene.add.text(786, 576, "Enemies: 0", {
      ...textStyle, fontSize: "11px", color: "#aa5555"
    }).setOrigin(1, 0).setDepth(depth);
  }

  /**
   * Update the HUD every frame.
   * @param {object} data - { health, maxHealth, score, level, timer, combo, enemyCount }
   */
  update(data) {
    // Health bar
    const healthPercent = Math.max(0, data.health / data.maxHealth);
    this.healthBar.setScale(healthPercent, 1);

    // Health bar color: green > yellow > red
    if (healthPercent > 0.5) {
      this.healthBar.setFillStyle(0x00ff88);
    } else if (healthPercent > 0.25) {
      this.healthBar.setFillStyle(0xffcc00);
    } else {
      this.healthBar.setFillStyle(0xff3333);
    }

    // Timer
    const seconds = Math.ceil(data.timer);
    this.timerText.setText(seconds.toString());

    // Timer color: white → yellow → red as time runs out
    if (seconds <= 10) {
      this.timerText.setColor("#ff3333");
    } else if (seconds <= 30) {
      this.timerText.setColor("#ffcc00");
    } else {
      this.timerText.setColor("#ffffff");
    }

    // Score
    this.scoreText.setText(`SCORE: ${data.score}`);

    // Level
    this.levelText.setText(`LEVEL ${data.level}`);

    // Enemy count
    this.enemyCountText.setText(`Enemies: ${data.enemyCount}`);
  }

  /**
   * Show combo popup.
   */
  showCombo(combo, multiplier) {
    if (combo < 2) return; // Don't show for single kills

    this.comboText.setText(`${combo}x COMBO! (${multiplier.toFixed(2)}x)`);
    this.comboText.setAlpha(1);

    // Animate: pop in and fade out
    this.scene.tweens.killTweensOf(this.comboText);
    this.comboText.setScale(1.5);

    this.scene.tweens.add({
      targets: this.comboText,
      scale: 1,
      alpha: 0,
      duration: 1500,
      ease: "Power2",
    });
  }

  /**
   * Show level-up banner.
   */
  showLevelUp(level) {
    this.levelUpText.setText(`⚡ LEVEL ${level} ⚡`);
    this.levelUpText.setAlpha(1);
    this.levelUpText.setScale(0.5);

    this.scene.tweens.add({
      targets: this.levelUpText,
      scale: 1.2,
      duration: 400,
      ease: "Back.easeOut",
      yoyo: true,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.levelUpText,
          alpha: 0,
          duration: 800,
          delay: 400,
        });
      },
    });
  }

  /**
   * Destroy all HUD elements.
   */
  destroy() {
    this.healthBarBg.destroy();
    this.healthBar.destroy();
    this.healthLabel.destroy();
    this.timerText.destroy();
    this.timerLabel.destroy();
    this.scoreText.destroy();
    this.levelText.destroy();
    this.comboText.destroy();
    this.levelUpText.destroy();
    this.weaponText.destroy();
    this.enemyCountText.destroy();
  }
}
