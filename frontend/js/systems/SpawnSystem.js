// systems/SpawnSystem.js
// Manages enemy spawning in waves based on the current difficulty level.

import { Crab, Eel, LavaFish } from "../entities/Enemy.js";

export default class SpawnSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {DifficultySystem} difficulty
   */
  constructor(scene, difficulty) {
    this.scene = scene;
    this.difficulty = difficulty;

    this.spawnTimer = 0; // Countdown to next spawn
    this.totalSpawnedThisLevel = 0;
    this.activeEnemies = []; // Track all living enemies for update calls
  }

  /**
   * Called every frame — handles spawn timing.
   * @param {number} delta - Ms since last frame
   */
  update(delta) {
    const config = this.difficulty.getLevelConfig();

    // Spawn timer countdown
    this.spawnTimer -= delta;

    if (this.spawnTimer <= 0 && this.totalSpawnedThisLevel < config.enemyCount) {
      this.spawnEnemy(config);
      this.spawnTimer = config.spawnInterval;
      this.totalSpawnedThisLevel++;
    }

    // Clean up dead enemies from tracking array
    this.activeEnemies = this.activeEnemies.filter((e) => e.isAlive && e.sprite.active);
  }

  /**
   * Spawn a single enemy based on current level weights.
   */
  spawnEnemy(config) {
    const pos = this.difficulty.getSpawnPosition();
    const type = this.pickEnemyType(config.weights);
    const mult = config.difficultyMultiplier;

    let enemy;
    switch (type) {
      case "crab":
        enemy = new Crab(this.scene, pos.x, pos.y, mult);
        break;
      case "eel":
        enemy = new Eel(this.scene, pos.x, pos.y, mult);
        break;
      case "lavafish":
        enemy = new LavaFish(this.scene, pos.x, pos.y, mult);
        break;
      default:
        enemy = new Crab(this.scene, pos.x, pos.y, mult);
    }

    this.activeEnemies.push(enemy);
    return enemy;
  }

  /**
   * Pick an enemy type based on weighted probabilities.
   * @param {object} weights - { crab: 0.5, eel: 0.3, lavafish: 0.2 }
   */
  pickEnemyType(weights) {
    const rand = Math.random();
    let cumulative = 0;

    for (const [type, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (rand <= cumulative) return type;
    }

    return "crab"; // Fallback
  }

  /**
   * Update all active enemies (called from GameScene).
   */
  updateEnemies(time, delta, playerPos) {
    this.activeEnemies.forEach((enemy) => {
      if (enemy.isAlive) {
        enemy.update(time, delta, playerPos);
      }
    });
  }

  /**
   * Check if all enemies for this level have been killed.
   */
  isLevelCleared() {
    const config = this.difficulty.getLevelConfig();
    return (
      this.totalSpawnedThisLevel >= config.enemyCount &&
      this.activeEnemies.filter((e) => e.isAlive).length === 0
    );
  }

  /**
   * Get count of currently alive enemies.
   */
  getAliveCount() {
    return this.activeEnemies.filter((e) => e.isAlive).length;
  }

  /**
   * Reset for a new level.
   */
  resetForLevel() {
    this.totalSpawnedThisLevel = 0;
    this.spawnTimer = 1000; // Brief delay before first spawn
  }

  /**
   * Full reset for a new match.
   */
  reset() {
    // Destroy remaining enemies
    this.activeEnemies.forEach((e) => e.destroy());
    this.activeEnemies = [];
    this.totalSpawnedThisLevel = 0;
    this.spawnTimer = 0;
  }
}
