// systems/ScoringSystem.js
// Tracks score, kills, combos, survival time, and applies reward multipliers.

export default class ScoringSystem {
  /**
   * @param {number} rewardMultiplier - From difficulty mode (0.5x to 5x)
   */
  constructor(rewardMultiplier = 1.0) {
    this.score = 0;
    this.kills = 0;
    this.killsByType = { crab: 0, eel: 0, lavafish: 0 };
    this.level = 1;
    this.survivalTime = 0;

    // Combo system
    this.combo = 0;
    this.comboTimer = 0;
    this.comboTimeout = 3000;
    this.maxCombo = 0;

    // Reward multiplier from difficulty mode
    this.rewardMultiplier = rewardMultiplier;

    // Total reward points (score * rewardMultiplier at end of match)
    this.rewardPoints = 0;
  }

  update(delta) {
    this.survivalTime += delta / 1000;

    if (this.combo > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }
  }

  /**
   * Register an enemy kill.
   */
  addKill(type, basePoints) {
    this.kills++;
    if (this.killsByType[type] !== undefined) {
      this.killsByType[type]++;
    }

    this.combo++;
    this.comboTimer = this.comboTimeout;

    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    // Combo multiplier
    const comboMultiplier = 1 + (this.combo - 1) * 0.25;
    const points = Math.round(basePoints * comboMultiplier);
    this.score += points;

    return { points, combo: this.combo, multiplier: comboMultiplier };
  }

  nextLevel() {
    this.level++;
  }

  getMultiplier() {
    if (this.combo <= 1) return 1;
    return 1 + (this.combo - 1) * 0.25;
  }

  /**
   * Get match summary including reward calculations.
   */
  getSummary() {
    // Final reward points = score * difficulty reward multiplier
    this.rewardPoints = Math.round(this.score * this.rewardMultiplier);

    return {
      score: this.score,
      kills: this.kills,
      killsByType: { ...this.killsByType },
      level: this.level,
      survivalTime: Math.round(this.survivalTime),
      maxCombo: this.maxCombo,
      rewardMultiplier: this.rewardMultiplier,
      rewardPoints: this.rewardPoints,
    };
  }

  reset() {
    this.score = 0;
    this.kills = 0;
    this.killsByType = { crab: 0, eel: 0, lavafish: 0 };
    this.level = 1;
    this.survivalTime = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.rewardPoints = 0;
  }
}
