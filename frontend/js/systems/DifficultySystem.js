// systems/DifficultySystem.js
// Manages difficulty scaling with 4 modes: Easy, Medium, Hard, Crazy Hard.
// Each mode multiplies enemy stats, spawn rates, and rewards differently.

import { DIFFICULTY_MODES } from "../scenes/MenuScene.js";

export default class DifficultySystem {
  /**
   * @param {string} mode - "easy", "medium", "hard", or "crazy"
   */
  constructor(mode = "medium") {
    this.level = 1;
    this.mode = mode;
    this.modeConfig = DIFFICULTY_MODES[mode] || DIFFICULTY_MODES.medium;

    // Base arena bounds
    this.baseArena = { x: 40, y: 50, width: 720, height: 500 };
    this.arena = { ...this.baseArena };
  }

  /**
   * Get configuration for the current level, scaled by difficulty mode.
   */
  getLevelConfig() {
    const level = this.level;
    const mc = this.modeConfig;

    return {
      // Enemy count scaled by mode
      enemyCount: Math.min(
        Math.round((5 + level * 2) * mc.spawnMultiplier),
        40
      ),

      // Enemy type weights
      weights: {
        crab: Math.max(0.2, 0.6 - level * 0.05),
        eel: Math.min(0.4, 0.2 + level * 0.03),
        lavafish: Math.min(0.4, 0.2 + level * 0.02),
      },

      // Enemy stats multiplier (HP, speed) — combines level + mode
      difficultyMultiplier: (1 + (level - 1) * 0.15) * mc.enemyMultiplier,

      // Speed multiplier for enemies
      speedMultiplier: mc.speedMultiplier,

      // Spawn interval (lower = faster spawns)
      spawnInterval: Math.max(
        500,
        Math.round((2000 - level * 150) / mc.spawnMultiplier)
      ),

      // Arena shrink per level
      arenaShrink: Math.min(level * 15, 120),

      // Reward multiplier for scoring
      rewardMultiplier: mc.rewardMultiplier,
    };
  }

  /**
   * Advance to next level.
   */
  nextLevel() {
    this.level++;
    const config = this.getLevelConfig();

    const shrink = config.arenaShrink;
    this.arena = {
      x: this.baseArena.x + shrink,
      y: this.baseArena.y + shrink,
      width: this.baseArena.width - shrink * 2,
      height: this.baseArena.height - shrink * 2,
    };

    if (this.arena.width < 200) this.arena.width = 200;
    if (this.arena.height < 200) this.arena.height = 200;

    return config;
  }

  getArena() {
    return { ...this.arena };
  }

  /**
   * Get a random spawn position on the arena edge.
   */
  getSpawnPosition() {
    const a = this.arena;
    const side = Math.floor(Math.random() * 4);

    switch (side) {
      case 0: return { x: a.x + Math.random() * a.width, y: a.y };
      case 1: return { x: a.x + a.width, y: a.y + Math.random() * a.height };
      case 2: return { x: a.x + Math.random() * a.width, y: a.y + a.height };
      case 3: return { x: a.x, y: a.y + Math.random() * a.height };
      default: return { x: a.x, y: a.y };
    }
  }

  /**
   * Get the reward multiplier label for display.
   */
  getRewardLabel() {
    return this.modeConfig.rewardLabel;
  }

  /**
   * Get the mode color.
   */
  getModeColor() {
    return this.modeConfig.color;
  }

  reset() {
    this.level = 1;
    this.arena = { ...this.baseArena };
  }
}
