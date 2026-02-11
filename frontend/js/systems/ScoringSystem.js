// systems/ScoringSystem.js
// Tracks the player's score, kills, combos, and survival time.
// This data will later be sent on-chain via GameSession.sol.

export default class ScoringSystem {
  constructor() {
    this.score = 0;
    this.kills = 0;
    this.killsByType = { crab: 0, eel: 0, lavafish: 0 };
    this.level = 1;
    this.survivalTime = 0; // Seconds survived

    // Combo system: rapid kills increase multiplier
    this.combo = 0;
    this.comboTimer = 0;
    this.comboTimeout = 3000; // Combo resets after 3 seconds without a kill
    this.maxCombo = 0; // Highest combo achieved
  }

  /**
   * Called every frame to update timers.
   * @param {number} delta - Ms since last frame
   */
  update(delta) {
    // Update survival time
    this.survivalTime += delta / 1000;

    // Combo timer countdown
    if (this.combo > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.combo = 0; // Combo expired
      }
    }
  }

  /**
   * Register an enemy kill.
   * @param {string} type - Enemy type (crab, eel, lavafish)
   * @param {number} basePoints - Base points for this enemy
   */
  addKill(type, basePoints) {
    this.kills++;
    if (this.killsByType[type] !== undefined) {
      this.killsByType[type]++;
    }

    // Increase combo
    this.combo++;
    this.comboTimer = this.comboTimeout;

    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    // Apply combo multiplier to score
    const comboMultiplier = 1 + (this.combo - 1) * 0.25; // 1x, 1.25x, 1.5x, 1.75x...
    const points = Math.round(basePoints * comboMultiplier);
    this.score += points;

    return { points, combo: this.combo, multiplier: comboMultiplier };
  }

  /**
   * Advance to the next level.
   */
  nextLevel() {
    this.level++;
  }

  /**
   * Get the current combo multiplier.
   */
  getMultiplier() {
    if (this.combo <= 1) return 1;
    return 1 + (this.combo - 1) * 0.25;
  }

  /**
   * Get a summary of the match (for game over screen and on-chain recording).
   */
  getSummary() {
    return {
      score: this.score,
      kills: this.kills,
      killsByType: { ...this.killsByType },
      level: this.level,
      survivalTime: Math.round(this.survivalTime),
      maxCombo: this.maxCombo,
    };
  }

  /**
   * Reset all stats for a new match.
   */
  reset() {
    this.score = 0;
    this.kills = 0;
    this.killsByType = { crab: 0, eel: 0, lavafish: 0 };
    this.level = 1;
    this.survivalTime = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
  }
}
