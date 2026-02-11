// systems/DifficultySystem.js
// Manages difficulty scaling across levels.
// Each level: more enemies, faster enemies, shrinking arena.

export default class DifficultySystem {
  constructor() {
    this.level = 1;

    // Base arena bounds (full game area)
    this.baseArena = { x: 40, y: 50, width: 720, height: 500 };

    // Current arena (shrinks each level)
    this.arena = { ...this.baseArena };
  }

  /**
   * Get the configuration for the current level.
   */
  getLevelConfig() {
    const level = this.level;

    return {
      // How many enemies to spawn this level
      enemyCount: Math.min(5 + level * 2, 30), // Starts at 7, caps at 30

      // Enemy composition weights (what % of each type spawns)
      // Early levels: mostly crabs. Later: more eels and lava fish.
      weights: {
        crab: Math.max(0.2, 0.6 - level * 0.05),
        eel: Math.min(0.4, 0.2 + level * 0.03),
        lavafish: Math.min(0.4, 0.2 + level * 0.02),
      },

      // Difficulty multiplier for enemy stats (HP, speed)
      difficultyMultiplier: 1 + (level - 1) * 0.15,

      // Spawn interval: how frequently new enemies appear (ms)
      spawnInterval: Math.max(800, 2000 - level * 150),

      // Arena shrink: reduce play area each level
      arenaShrink: Math.min(level * 15, 120), // Max shrink of 120px per side
    };
  }

  /**
   * Advance to the next level and update arena bounds.
   */
  nextLevel() {
    this.level++;
    const config = this.getLevelConfig();

    // Shrink the arena
    const shrink = config.arenaShrink;
    this.arena = {
      x: this.baseArena.x + shrink,
      y: this.baseArena.y + shrink,
      width: this.baseArena.width - shrink * 2,
      height: this.baseArena.height - shrink * 2,
    };

    // Minimum arena size
    if (this.arena.width < 200) this.arena.width = 200;
    if (this.arena.height < 200) this.arena.height = 200;

    return config;
  }

  /**
   * Get current arena bounds.
   */
  getArena() {
    return { ...this.arena };
  }

  /**
   * Get a random spawn position on the edge of the arena
   * (enemies spawn from the borders, not on top of the player).
   */
  getSpawnPosition() {
    const a = this.arena;
    const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left

    switch (side) {
      case 0: // Top edge
        return { x: a.x + Math.random() * a.width, y: a.y };
      case 1: // Right edge
        return { x: a.x + a.width, y: a.y + Math.random() * a.height };
      case 2: // Bottom edge
        return { x: a.x + Math.random() * a.width, y: a.y + a.height };
      case 3: // Left edge
        return { x: a.x, y: a.y + Math.random() * a.height };
      default:
        return { x: a.x, y: a.y };
    }
  }

  /**
   * Reset to level 1.
   */
  reset() {
    this.level = 1;
    this.arena = { ...this.baseArena };
  }
}
