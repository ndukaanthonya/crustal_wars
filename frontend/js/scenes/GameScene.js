// scenes/GameScene.js
// The main gameplay scene — 90-second arena rounds with escalating difficulty.
// Handles: player, enemies, bullets, collisions, scoring, and level transitions.

import Phaser from "phaser";
import Player from "../entities/Player.js";
import ScoringSystem from "../systems/ScoringSystem.js";
import DifficultySystem from "../systems/DifficultySystem.js";
import SpawnSystem from "../systems/SpawnSystem.js";
import HUD from "../ui/HUD.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    // === RESET SYSTEMS ===
    this.scoring = new ScoringSystem();
    this.difficulty = new DifficultySystem();
    this.spawner = new SpawnSystem(this, this.difficulty);

    // === MATCH TIMER (90 seconds) ===
    this.matchTimer = 90;
    this.matchActive = true;
    this.levelTransitioning = false;

    // === ARENA BORDER ===
    this.arenaBorder = this.add.graphics();
    this.drawArenaBorder();

    // === PHYSICS GROUPS ===
    // Player bullets group (pool of reusable bullet sprites)
    this.playerBullets = this.physics.add.group({
      defaultKey: "bullet",
      maxSize: 30, // Max 30 bullets on screen at once
    });

    // Enemy bullets group
    this.enemyBullets = this.physics.add.group({
      defaultKey: "enemy-bullet",
      maxSize: 20,
    });

    // Enemies group
    this.enemies = this.physics.add.group();

    // === CREATE PLAYER ===
    const arena = this.difficulty.getArena();
    this.player = new Player(
      this,
      arena.x + arena.width / 2,
      arena.y + arena.height / 2
    );

    // === COLLISIONS ===
    // Player bullets hit enemies
    this.physics.add.overlap(
      this.playerBullets,
      this.enemies,
      this.onBulletHitEnemy,
      null,
      this
    );

    // Enemies touch the player
    this.physics.add.overlap(
      this.player.sprite,
      this.enemies,
      this.onEnemyHitPlayer,
      null,
      this
    );

    // Enemy bullets hit the player
    this.physics.add.overlap(
      this.player.sprite,
      this.enemyBullets,
      this.onEnemyBulletHitPlayer,
      null,
      this
    );

    // === HUD ===
    this.hud = new HUD(this);

    // === START SPAWNING ===
    this.spawner.resetForLevel();

    // Contact damage cooldown tracking per enemy
    this.contactCooldowns = new Map();
  }

  /**
   * Main game loop — called every frame (~60 times per second).
   */
  update(time, delta) {
    if (!this.matchActive) return;

    // === UPDATE TIMER ===
    this.matchTimer -= delta / 1000;

    // Timer expired — advance to next level
    if (this.matchTimer <= 0 && !this.levelTransitioning) {
      this.matchTimer = 0;
      this.advanceLevel();
      return;
    }

    // Also advance if all enemies are cleared early
    if (
      !this.levelTransitioning &&
      this.matchTimer < 85 && // Give at least 5 seconds before checking
      this.spawner.isLevelCleared()
    ) {
      this.advanceLevel();
      return;
    }

    // === UPDATE PLAYER ===
    this.player.update(time, delta);

    // === UPDATE SPAWNER & ENEMIES ===
    this.spawner.update(delta);
    this.spawner.updateEnemies(time, delta, this.player.getPosition());

    // === UPDATE SCORING ===
    this.scoring.update(delta);

    // === UPDATE HUD ===
    this.hud.update({
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      score: this.scoring.score,
      level: this.difficulty.level,
      timer: this.matchTimer,
      combo: this.scoring.combo,
      enemyCount: this.spawner.getAliveCount(),
    });

    // === CLEAN UP OFF-SCREEN BULLETS ===
    this.cleanupBullets();
  }

  // ============================================================
  // COLLISION HANDLERS
  // ============================================================

  /**
   * Player bullet hits an enemy.
   */
  onBulletHitEnemy(bullet, enemySprite) {
    if (!bullet.active || !enemySprite.active) return;

    const enemy = enemySprite.parentEntity;
    if (!enemy) return;

    const damage = bullet.damage || 25;
    const killed = enemy.takeDamage(damage);

    // Show damage number
    this.showDamageNumber(enemySprite.x, enemySprite.y, damage);

    // Update combo display if killed
    if (killed) {
      const result = { combo: this.scoring.combo, multiplier: this.scoring.getMultiplier() };
      this.hud.showCombo(result.combo, result.multiplier);
    }

    // Destroy the bullet
    bullet.destroy();
  }

  /**
   * Enemy physically touches the player (contact damage).
   */
  onEnemyHitPlayer(playerSprite, enemySprite) {
    if (!playerSprite.active || !enemySprite.active) return;

    const enemy = enemySprite.parentEntity;
    if (!enemy || !this.player.isAlive) return;

    // Cooldown: prevent rapid-fire contact damage from same enemy
    const now = this.time.now;
    const lastContact = this.contactCooldowns.get(enemySprite) || 0;
    if (now - lastContact < 500) return; // 500ms cooldown between contact hits
    this.contactCooldowns.set(enemySprite, now);

    this.player.takeDamage(enemy.damage);
  }

  /**
   * Enemy bullet hits the player.
   */
  onEnemyBulletHitPlayer(playerSprite, bullet) {
    if (!bullet.active || !this.player.isAlive) return;

    const damage = bullet.damage || 10;
    this.player.takeDamage(damage);

    bullet.destroy();
  }

  // ============================================================
  // LEVEL MANAGEMENT
  // ============================================================

  /**
   * Advance to the next level — more enemies, harder difficulty, shrinking arena.
   */
  advanceLevel() {
    this.levelTransitioning = true;

    // Clear remaining enemies
    this.spawner.reset();
    this.enemies.clear(true, true);
    this.enemyBullets.clear(true, true);
    this.contactCooldowns.clear();

    // Advance difficulty
    this.difficulty.nextLevel();
    this.scoring.nextLevel();

    // Reset timer for new round
    this.matchTimer = 90;

    // Redraw arena border (it shrinks)
    this.drawArenaBorder();

    // Update physics world bounds to match new arena
    const arena = this.difficulty.getArena();
    this.physics.world.setBounds(arena.x, arena.y, arena.width, arena.height);
    this.player.sprite.setCollideWorldBounds(true);

    // Show level-up banner
    this.hud.showLevelUp(this.difficulty.level);

    // Brief pause before spawning new enemies
    this.time.delayedCall(1500, () => {
      this.spawner.resetForLevel();
      this.levelTransitioning = false;
    });
  }

  // ============================================================
  // PLAYER DEATH
  // ============================================================

  /**
   * Called when the player dies.
   */
  onPlayerDeath() {
    this.matchActive = false;

    // Brief pause then go to game over
    this.time.delayedCall(1000, () => {
      const summary = this.scoring.getSummary();
      this.scene.start("GameOverScene", { summary });
    });
  }

  // ============================================================
  // VISUAL HELPERS
  // ============================================================

  /**
   * Draw the arena border (visualizes the shrinking play area).
   */
  drawArenaBorder() {
    this.arenaBorder.clear();
    const arena = this.difficulty.getArena();

    // Outer border glow
    this.arenaBorder.lineStyle(3, 0x1a3a5f, 0.8);
    this.arenaBorder.strokeRect(arena.x, arena.y, arena.width, arena.height);

    // Inner border
    this.arenaBorder.lineStyle(1, 0x00ffcc, 0.3);
    this.arenaBorder.strokeRect(arena.x + 2, arena.y + 2, arena.width - 4, arena.height - 4);

    // Corner accents
    const cornerSize = 10;
    this.arenaBorder.lineStyle(2, 0x00ffcc, 0.6);
    // Top-left
    this.arenaBorder.lineBetween(arena.x, arena.y, arena.x + cornerSize, arena.y);
    this.arenaBorder.lineBetween(arena.x, arena.y, arena.x, arena.y + cornerSize);
    // Top-right
    this.arenaBorder.lineBetween(arena.x + arena.width, arena.y, arena.x + arena.width - cornerSize, arena.y);
    this.arenaBorder.lineBetween(arena.x + arena.width, arena.y, arena.x + arena.width, arena.y + cornerSize);
    // Bottom-left
    this.arenaBorder.lineBetween(arena.x, arena.y + arena.height, arena.x + cornerSize, arena.y + arena.height);
    this.arenaBorder.lineBetween(arena.x, arena.y + arena.height, arena.x, arena.y + arena.height - cornerSize);
    // Bottom-right
    this.arenaBorder.lineBetween(arena.x + arena.width, arena.y + arena.height, arena.x + arena.width - cornerSize, arena.y + arena.height);
    this.arenaBorder.lineBetween(arena.x + arena.width, arena.y + arena.height, arena.x + arena.width, arena.y + arena.height - cornerSize);

    // Set physics bounds
    this.physics.world.setBounds(arena.x, arena.y, arena.width, arena.height);
  }

  /**
   * Show a floating damage number.
   */
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

  /**
   * Remove bullets that have gone off-screen.
   */
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
