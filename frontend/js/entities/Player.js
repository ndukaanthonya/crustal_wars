// entities/Player.js
// The player character — has a pump-action rifle that points where the mouse aims.
// Controls: WASD/Arrows for movement, mouse aim + click for shooting, Space for melee.
// The rifle sprite rotates independently to always face the cursor.

import Phaser from "phaser";

export default class Player {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x - Starting X
   * @param {number} y - Starting Y
   */
  constructor(scene, x, y) {
    this.scene = scene;

    // === PLAYER BODY SPRITE ===
    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setScale(2);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.sprite.parentEntity = this;

    // === RIFLE SPRITE (separate, rotates to follow mouse) ===
    this.rifle = scene.add.image(x, y, "rifle");
    this.rifle.setScale(2);
    this.rifle.setDepth(11); // Above the player body
    this.rifle.setOrigin(0.15, 0.5); // Pivot near the stock end so it rotates from the grip

    // === CROSSHAIR (follows mouse) ===
    this.crosshair = scene.add.image(0, 0, "crosshair");
    this.crosshair.setScale(2);
    this.crosshair.setDepth(100);
    this.crosshair.setAlpha(0.8);

    // Hide the default cursor
    scene.input.setDefaultCursor("none");

    // === STATS ===
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.speed = 200;
    this.isAlive = true;

    // === RANGED WEAPON ===
    this.bulletSpeed = 500;
    this.shootCooldown = 300; // ms between shots
    this.lastShotTime = 0;

    // === MELEE WEAPON ===
    this.meleeRange = 55;
    this.meleeDamage = 40;
    this.meleeCooldown = 500;
    this.lastMeleeTime = 0;

    // === INPUT ===
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Mouse click to shoot
    scene.input.on("pointerdown", (pointer) => {
      if (this.isAlive) {
        this.shootAt(pointer.worldX, pointer.worldY);
      }
    });

    // === INVULNERABILITY ===
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.invulnerableDuration = 500;

    // Current aim angle (radians)
    this.aimAngle = 0;
  }

  /**
   * Called every frame.
   */
  update(time, delta) {
    if (!this.isAlive) return;

    // === MOVEMENT ===
    let vx = 0;
    let vy = 0;

    if (this.keys.left.isDown || this.cursors.left.isDown) vx = -1;
    if (this.keys.right.isDown || this.cursors.right.isDown) vx = 1;
    if (this.keys.up.isDown || this.cursors.up.isDown) vy = -1;
    if (this.keys.down.isDown || this.cursors.down.isDown) vy = 1;

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.sprite.setVelocity(vx * this.speed, vy * this.speed);

    // === AIM RIFLE AT MOUSE ===
    const pointer = this.scene.input.activePointer;
    this.aimAngle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      pointer.worldX, pointer.worldY
    );

    // Position rifle at player's center
    this.rifle.setPosition(this.sprite.x, this.sprite.y + 4);
    this.rifle.setRotation(this.aimAngle);

    // Flip rifle vertically when aiming left (so it doesn't appear upside down)
    if (this.aimAngle > Math.PI / 2 || this.aimAngle < -Math.PI / 2) {
      this.rifle.setFlipY(true);
    } else {
      this.rifle.setFlipY(false);
    }

    // === UPDATE CROSSHAIR ===
    this.crosshair.setPosition(pointer.worldX, pointer.worldY);

    // === MELEE ===
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.meleeAttack(time);
    }

    // === INVULNERABILITY ===
    if (this.isInvulnerable) {
      this.invulnerableTimer -= delta;
      this.sprite.setAlpha(Math.sin(time * 0.02) > 0 ? 1 : 0.3);
      this.rifle.setAlpha(this.sprite.alpha);
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        this.sprite.setAlpha(1);
        this.rifle.setAlpha(1);
      }
    }
  }

  /**
   * Shoot a laser projectile from the rifle muzzle toward the aim point.
   */
  shootAt(targetX, targetY) {
    const now = this.scene.time.now;
    if (now - this.lastShotTime < this.shootCooldown) return;
    this.lastShotTime = now;

    // Calculate muzzle position (end of the rifle barrel)
    const muzzleDistance = 36; // Distance from player center to muzzle tip
    const muzzleX = this.sprite.x + Math.cos(this.aimAngle) * muzzleDistance;
    const muzzleY = this.sprite.y + 4 + Math.sin(this.aimAngle) * muzzleDistance;

    // Create bullet at muzzle position
    const bullet = this.scene.playerBullets.create(muzzleX, muzzleY, "bullet");
    if (!bullet) return;

    bullet.setScale(2);
    bullet.setRotation(this.aimAngle);
    bullet.setVelocity(
      Math.cos(this.aimAngle) * this.bulletSpeed,
      Math.sin(this.aimAngle) * this.bulletSpeed
    );
    bullet.damage = 25;

    // === MUZZLE FLASH EFFECT ===
    const flash = this.scene.add.image(muzzleX, muzzleY, "muzzle-flash");
    flash.setScale(2);
    flash.setRotation(this.aimAngle);
    flash.setDepth(12);
    flash.setAlpha(0.9);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 3,
      duration: 100,
      onComplete: () => flash.destroy(),
    });

    // Slight recoil — nudge rifle back briefly
    this.scene.tweens.add({
      targets: this.rifle,
      x: this.rifle.x - Math.cos(this.aimAngle) * 3,
      y: this.rifle.y - Math.sin(this.aimAngle) * 3,
      duration: 50,
      yoyo: true,
    });

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
            const angle = Phaser.Math.Angle.Between(
              this.sprite.x, this.sprite.y, enemy.x, enemy.y
            );
            enemy.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
          }
        }
      });
    }
  }

  /**
   * Player takes damage.
   */
  takeDamage(amount) {
    if (this.isInvulnerable || !this.isAlive) return;

    this.health -= amount;
    this.isInvulnerable = true;
    this.invulnerableTimer = this.invulnerableDuration;
    this.scene.cameras.main.shake(100, 0.01);

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
    this.rifle.setAlpha(0.3);
    this.rifle.setTint(0xff0000);
    this.crosshair.setVisible(false);

    // Restore default cursor
    this.scene.input.setDefaultCursor("default");

    if (this.scene.onPlayerDeath) {
      this.scene.onPlayerDeath();
    }
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  destroy() {
    if (this.sprite) this.sprite.destroy();
    if (this.rifle) this.rifle.destroy();
    if (this.crosshair) this.crosshair.destroy();
    this.scene.input.setDefaultCursor("default");
  }
}
