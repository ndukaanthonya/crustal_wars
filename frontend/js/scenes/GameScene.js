// scenes/GameScene.js
// Core gameplay — 90-second arena rounds with difficulty mode support.

import Phaser from "phaser";
import Player from "../entities/Player.js";
import ScoringSystem from "../systems/ScoringSystem.js";
import DifficultySystem from "../systems/DifficultySystem.js";
import SpawnSystem from "../systems/SpawnSystem.js";
import HUD from "../ui/HUD.js";
import { DIFFICULTY_MODES } from "./MenuScene.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  /**
   * Receives difficulty mode from MenuScene.
   */
  init(data) {
    this.difficultyMode = data.difficulty || "medium";
  }

  create() {
    const modeConfig = DIFFICULTY_MODES[this.difficultyMode] || DIFFICULTY_MODES.medium;

    // === SYSTEMS ===
    this.difficulty = new DifficultySystem(this.difficultyMode);
    this.scoring = new ScoringSystem(modeConfig.rewardMultiplier);
    this.spawner = new SpawnSystem(this, this.difficulty);

    // === MATCH STATE ===
    this.matchTimer = 90;
    this.matchActive = true;
    this.levelTransitioning = false;

    // === ARENA BORDER ===
    this.arenaBorder = this.add.graphics();
    this.drawArenaBorder();

    // === DIFFICULTY MODE INDICATOR (top of screen) ===
    this.add.text(400, 48, `${modeConfig.label} MODE — ${modeConfig.rewardLabel}`, {
      fontSize: "9px",
      fontFamily: "Courier New",
      color: modeConfig.color,
    }).setOrigin(0.5).setDepth(100).setAlpha(0.7);

    // === PHYSICS GROUPS ===
    this.playerBullets = this.physics.add.group({
      defaultKey: "bullet",
      maxSize: 30,
    });

    this.enemyBullets = this.physics.add.group({
      defaultKey: "enemy-bullet",
      maxSize: 20,
    });

    this.enemies = this.physics.add.group();

    // === PLAYER ===
    const arena = this.difficulty.getArena();
    this.player = new Player(
      this,
      arena.x + arena.width / 2,
      arena.y + arena.height / 2
    );

    // === COLLISIONS ===
    this.physics.add.overlap(this.playerBullets, this.enemies, this.onBulletHitEnemy, null, this);
    this.physics.add.overlap(this.player.sprite, this.enemies, this.onEnemyHitPlayer, null, this);
    this.physics.add.overlap(this.player.sprite, this.enemyBullets, this.onEnemyBulletHitPlayer, null, this);

    // === HUD ===
    this.hud = new HUD(this);

    // === START ===
    this.spawner.resetForLevel();
    this.contactCooldowns = new Map();
  }

  update(time, delta) {
    if (!this.matchActive) return;

    // Timer
    this.matchTimer -= delta / 1000;

    if (this.matchTimer <= 0 && !this.levelTransitioning) {
      this.matchTimer = 0;
      this.advanceLevel();
      return;
    }

    // Early level clear
    if (!this.levelTransitioning && this.matchTimer < 85 && this.spawner.isLevelCleared()) {
      this.advanceLevel();
      return;
    }

    // Updates
    this.player.update(time, delta);
    this.spawner.update(delta);
    this.spawner.updateEnemies(time, delta, this.player.getPosition());
    this.scoring.update(delta);

    // HUD
    this.hud.update({
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      score: this.scoring.score,
      level: this.difficulty.level,
      timer: this.matchTimer,
      combo: this.scoring.combo,
      enemyCount: this.spawner.getAliveCount(),
    });

    this.cleanupBullets();
  }

  // === COLLISIONS ===

  onBulletHitEnemy(bullet, enemySprite) {
    if (!bullet.active || !enemySprite.active) return;

    const enemy = enemySprite.parentEntity;
    if (!enemy) return;

    const damage = bullet.damage || 25;
    const killed = enemy.takeDamage(damage);

    this.showDamageNumber(enemySprite.x, enemySprite.y, damage);

    if (killed) {
      const result = { combo: this.scoring.combo, multiplier: this.scoring.getMultiplier() };
      this.hud.showCombo(result.combo, result.multiplier);
    }

    bullet.destroy();
  }

  onEnemyHitPlayer(playerSprite, enemySprite) {
    if (!playerSprite.active || !enemySprite.active) return;

    const enemy = enemySprite.parentEntity;
    if (!enemy || !this.player.isAlive) return;

    const now = this.time.now;
    const lastContact = this.contactCooldowns.get(enemySprite) || 0;
    if (now - lastContact < 500) return;
    this.contactCooldowns.set(enemySprite, now);

    this.player.takeDamage(enemy.damage);
  }

  onEnemyBulletHitPlayer(playerSprite, bullet) {
    if (!bullet.active || !this.player.isAlive) return;

    this.player.takeDamage(bullet.damage || 10);
    bullet.destroy();
  }

  // === LEVEL MANAGEMENT ===

  advanceLevel() {
    this.levelTransitioning = true;

    this.spawner.reset();
    this.enemies.clear(true, true);
    this.enemyBullets.clear(true, true);
    this.contactCooldowns.clear();

    this.difficulty.nextLevel();
    this.scoring.nextLevel();
    this.matchTimer = 90;

    this.drawArenaBorder();

    const arena = this.difficulty.getArena();
    this.physics.world.setBounds(arena.x, arena.y, arena.width, arena.height);
    this.player.sprite.setCollideWorldBounds(true);

    this.hud.showLevelUp(this.difficulty.level);

    this.time.delayedCall(1500, () => {
      this.spawner.resetForLevel();
      this.levelTransitioning = false;
    });
  }

  // === PLAYER DEATH ===

  onPlayerDeath() {
    this.matchActive = false;

    this.time.delayedCall(1000, () => {
      const summary = this.scoring.getSummary();
      this.scene.start("GameOverScene", {
        summary,
        difficulty: this.difficultyMode,
      });
    });
  }

  // === VISUALS ===

  drawArenaBorder() {
    this.arenaBorder.clear();
    const arena = this.difficulty.getArena();

    this.arenaBorder.lineStyle(3, 0x1a3a5f, 0.8);
    this.arenaBorder.strokeRect(arena.x, arena.y, arena.width, arena.height);
    this.arenaBorder.lineStyle(1, 0x00ffcc, 0.3);
    this.arenaBorder.strokeRect(arena.x + 2, arena.y + 2, arena.width - 4, arena.height - 4);

    const cs = 10;
    this.arenaBorder.lineStyle(2, 0x00ffcc, 0.6);
    this.arenaBorder.lineBetween(arena.x, arena.y, arena.x + cs, arena.y);
    this.arenaBorder.lineBetween(arena.x, arena.y, arena.x, arena.y + cs);
    this.arenaBorder.lineBetween(arena.x + arena.width, arena.y, arena.x + arena.width - cs, arena.y);
    this.arenaBorder.lineBetween(arena.x + arena.width, arena.y, arena.x + arena.width, arena.y + cs);
    this.arenaBorder.lineBetween(arena.x, arena.y + arena.height, arena.x + cs, arena.y + arena.height);
    this.arenaBorder.lineBetween(arena.x, arena.y + arena.height, arena.x, arena.y + arena.height - cs);
    this.arenaBorder.lineBetween(arena.x + arena.width, arena.y + arena.height, arena.x + arena.width - cs, arena.y + arena.height);
    this.arenaBorder.lineBetween(arena.x + arena.width, arena.y + arena.height, arena.x + arena.width, arena.y + arena.height - cs);

    this.physics.world.setBounds(arena.x, arena.y, arena.width, arena.height);
  }

  showDamageNumber(x, y, amount) {
    const text = this.add.text(x, y - 10, `-${amount}`, {
      fontSize: "14px",
      fontFamily: "Courier New",
      color: "#ff6644",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(50);

    this.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 600,
      onComplete: () => text.destroy(),
    });
  }

  cleanupBullets() {
    const bounds = this.physics.world.bounds;
    const margin = 50;

    [this.playerBullets, this.enemyBullets].forEach((group) => {
      group.getChildren().forEach((bullet) => {
        if (
          bullet.active &&
          (bullet.x < bounds.x - margin ||
            bullet.x > bounds.x + bounds.width + margin ||
            bullet.y < bounds.y - margin ||
            bullet.y > bounds.y + bounds.height + margin)
        ) {
          bullet.destroy();
        }
      });
    });
  }
}
