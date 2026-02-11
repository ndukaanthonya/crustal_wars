// entities/Player.js
// The player character — handles movement, shooting, melee attacks, and health.
// Controls: WASD/Arrows for movement, mouse click for ranged, Space for melee.

import Phaser from "phaser";

export default class Player {
  /**
   * @param {Phaser.Scene} scene - The game scene
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   */
  constructor(scene, x, y) {
    this.scene = scene;

    // Create the player sprite with physics
    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setScale(2);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10); // Player renders above most things

    // Give the sprite a reference back to this Player object
    this.sprite.parentEntity = this;

    // === STATS ===
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.speed = 200; // Pixels per second
    this.isAlive = true;

    // === RANGED WEAPON ===
    this.bulletSpeed = 400;
    this.shootCooldown = 300; // Milliseconds between shots
    this.lastShotTime = 0;

    // === MELEE WEAPON ===
    this.meleeRange = 50; // Pixels
    this.meleeDamage = 40;
    this.meleeCooldown = 500; // Milliseconds
    this.lastMeleeTime = 0;

    // === INPUT SETUP ===
    // WASD keys
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Arrow keys
    this.cursors = scene.input.keyboard.createCursorKeys();

    // Space for melee
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Mouse click for shooting
    scene.input.on("pointerdown", (pointer) => {
      if (this.isAlive) {
        this.shootAt(pointer.worldX, pointer.worldY);
      }
    });

    // === INVULNERABILITY (brief flash after taking damage) ===
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.invulnerableDuration = 500; // ms of invulnerability after hit
  }

  /**
   * Called every frame — handles input and movement.
   * @param {number} time - Current game time
   * @param {number} delta - Ms since last frame
   */
  update(time, delta) {
    if (!this.isAlive) return;

    // === MOVEMENT ===
    let vx = 0;
    let vy = 0;

    // Check WASD and arrow keys
    if (this.keys.left.isDown || this.cursors.left.isDown) vx = -1;
    if (this.keys.right.isDown || this.cursors.right.isDown) vx = 1;
    if (this.keys.up.isDown || this.cursors.up.isDown) vy = -1;
    if (this.keys.down.isDown || this.cursors.down.isDown) vy = 1;

    // Normalize diagonal movement (so diagonal isn't faster)
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707; // 1/sqrt(2)
      vy *= 0.707;
    }

    this.sprite.setVelocity(vx * this.speed, vy * this.speed);

    // === MELEE ATTACK (Space key) ===
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.meleeAttack(time);
    }

    // === INVULNERABILITY TIMER ===
    if (this.isInvulnerable) {
      this.invulnerableTimer -= delta;
      // Flash effect — toggle visibility rapidly
      this.sprite.setAlpha(Math.sin(time * 0.02) > 0 ? 1 : 0.3);
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        this.sprite.setAlpha(1);
      }
    }
  }

  /**
   * Shoot a projectile toward target coordinates.
   */
  shootAt(targetX, targetY) {
    const now = this.scene.time.now;
    if (now - this.lastShotTime < this.shootCooldown) return; // Still on cooldown
    this.lastShotTime = now;

    // Calculate direction from player to target
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y, targetX, targetY
    );

    // Create bullet
    const bullet = this.scene.playerBullets.create(
      this.sprite.x, this.sprite.y, "bullet"
    );
    if (!bullet) return; // Pool exhausted

    bullet.setScale(2);
    bullet.setRotation(angle);
    bullet.setVelocity(
      Math.cos(angle) * this.bulletSpeed,
      Math.sin(angle) * this.bulletSpeed
    );
    bullet.damage = 25; // Damage per bullet

    // Auto-destroy bullet after 2 seconds
    this.scene.time.delayedCall(2000, () => {
      if (bullet.active) bullet.destroy();
    });
  }

  /**
   * Melee attack — damages all enemies within range.
   */
  meleeAttack(time) {
    if (time - this.lastMeleeTime < this.meleeCooldown) return;
    this.lastMeleeTime = time;

    // Visual slash effect
    const slash = this.scene.add.image(this.sprite.x, this.sprite.y, "slash");
    slash.setScale(2);
    slash.setAlpha(0.7);
    slash.setDepth(11);

    // Animate and remove slash
    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scale: 3,
      duration: 200,
      onComplete: () => slash.destroy(),
    });

    // Damage nearby enemies
    if (this.scene.enemies) {
      this.scene.enemies.getChildren().forEach((enemy) => {
        if (!enemy.active) return;
        const dist = Phaser.Math.Distance.Between(
          this.sprite.x, this.sprite.y, enemy.x, enemy.y
        );
        if (dist <= this.meleeRange) {
          const entity = enemy.parentEntity;
          if (entity && entity.takeDamage) {
            entity.takeDamage(this.meleeDamage);
            // Knockback effect
            const angle = Phaser.Math.Angle.Between(
              this.sprite.x, this.sprite.y, enemy.x, enemy.y
            );
            enemy.setVelocity(
              Math.cos(angle) * 300,
              Math.sin(angle) * 300
            );
          }
        }
      });
    }
  }

  /**
   * Player takes damage from enemies.
   */
  takeDamage(amount) {
    if (this.isInvulnerable || !this.isAlive) return;

    this.health -= amount;

    // Brief invulnerability after hit
    this.isInvulnerable = true;
    this.invulnerableTimer = this.invulnerableDuration;

    // Screen shake effect
    this.scene.cameras.main.shake(100, 0.01);

    // Check for death
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }

  /**
   * Player death.
   */
  die() {
    this.isAlive = false;
    this.sprite.setVelocity(0, 0);
    this.sprite.setAlpha(0.4);
    this.sprite.setTint(0xff0000);

    // Notify the game scene
    if (this.scene.onPlayerDeath) {
      this.scene.onPlayerDeath();
    }
  }

  /**
   * Get the player's position.
   */
  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Clean up resources.
   */
  destroy() {
    if (this.sprite) this.sprite.destroy();
  }
}
