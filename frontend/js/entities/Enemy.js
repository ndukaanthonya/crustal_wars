// entities/Enemy.js
// Base Enemy class and 3 enemy types:
// - Crab: slow, tanky (high HP, low speed)
// - Eel: fast, fragile (low HP, high speed)
// - LavaFish: medium, shoots projectiles back at player

import Phaser from "phaser";

// ============================================================
// BASE ENEMY — Shared behavior for all enemy types
// ============================================================
class BaseEnemy {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x - Spawn X
   * @param {number} y - Spawn Y
   * @param {string} texture - Texture key
   * @param {object} stats - { health, speed, damage, points }
   */
  constructor(scene, x, y, texture, stats) {
    this.scene = scene;

    // Create physics sprite and add to the enemies group
    this.sprite = scene.enemies.create(x, y, texture);
    this.sprite.setScale(2);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.parentEntity = this; // Reference back to this object

    // Stats
    this.maxHealth = stats.health;
    this.health = stats.health;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.points = stats.points; // Score points awarded on kill
    this.type = stats.type;

    this.isAlive = true;

    // Flash effect timer when hit
    this.flashTimer = 0;
  }

  /**
   * Called every frame — override in subclass for custom behavior.
   */
  update(time, delta, playerPos) {
    if (!this.isAlive || !this.sprite.active) return;

    // Flash effect countdown
    if (this.flashTimer > 0) {
      this.flashTimer -= delta;
      if (this.flashTimer <= 0) {
        this.sprite.clearTint();
      }
    }

    // Default behavior: move toward the player
    this.moveToward(playerPos.x, playerPos.y);
  }

  /**
   * Move toward a target position.
   */
  moveToward(targetX, targetY) {
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y, targetX, targetY
    );
    this.sprite.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  /**
   * Take damage. Returns true if enemy dies.
   */
  takeDamage(amount) {
    if (!this.isAlive) return false;

    this.health -= amount;

    // Flash white briefly
    this.sprite.setTint(0xffffff);
    this.flashTimer = 100;

    if (this.health <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  /**
   * Enemy death — award points, play death effect, destroy.
   */
  die() {
    this.isAlive = false;

    // Death particle effect — simple expanding circle
    const deathFx = this.scene.add.circle(
      this.sprite.x, this.sprite.y, 4, 0xff4444, 0.8
    );
    deathFx.setDepth(5);

    this.scene.tweens.add({
      targets: deathFx,
      radius: 20,
      alpha: 0,
      duration: 300,
      onComplete: () => deathFx.destroy(),
    });

    // Award points to scoring system
    if (this.scene.scoring) {
      this.scene.scoring.addKill(this.type, this.points);
    }

    // Destroy the sprite
    this.sprite.destroy();
  }

  /**
   * Destroy this enemy (cleanup).
   */
  destroy() {
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }
}

// ============================================================
// CRAB — Slow, tanky, walks straight at the player
// ============================================================
export class Crab extends BaseEnemy {
  constructor(scene, x, y, difficultyMultiplier = 1) {
    super(scene, x, y, "crab", {
      health: 80 * difficultyMultiplier,
      speed: 50 + 10 * difficultyMultiplier,
      damage: 15,
      points: 10,
      type: "crab",
    });
  }

  update(time, delta, playerPos) {
    super.update(time, delta, playerPos);
    // Crabs just walk straight at the player (default behavior)
  }
}

// ============================================================
// EEL — Fast, fragile, zigzag movement pattern
// ============================================================
export class Eel extends BaseEnemy {
  constructor(scene, x, y, difficultyMultiplier = 1) {
    super(scene, x, y, "eel", {
      health: 30 * difficultyMultiplier,
      speed: 120 + 20 * difficultyMultiplier,
      damage: 10,
      points: 15,
      type: "eel",
    });

    // Zigzag movement parameters
    this.zigzagTimer = 0;
    this.zigzagOffset = 0;
    this.zigzagFrequency = 800; // ms per zigzag cycle
  }

  update(time, delta, playerPos) {
    if (!this.isAlive || !this.sprite.active) return;

    // Flash effect
    if (this.flashTimer > 0) {
      this.flashTimer -= delta;
      if (this.flashTimer <= 0) this.sprite.clearTint();
    }

    // Zigzag: move toward player but oscillate perpendicular
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y, playerPos.x, playerPos.y
    );

    // Calculate perpendicular zigzag offset
    this.zigzagTimer += delta;
    this.zigzagOffset = Math.sin(this.zigzagTimer / this.zigzagFrequency * Math.PI * 2) * 0.8;

    const finalAngle = angle + this.zigzagOffset;
    this.sprite.setVelocity(
      Math.cos(finalAngle) * this.speed,
      Math.sin(finalAngle) * this.speed
    );
  }
}

// ============================================================
// LAVA FISH — Medium stats, shoots fireballs at the player
// ============================================================
export class LavaFish extends BaseEnemy {
  constructor(scene, x, y, difficultyMultiplier = 1) {
    super(scene, x, y, "lavafish", {
      health: 50 * difficultyMultiplier,
      speed: 70 + 10 * difficultyMultiplier,
      damage: 12,
      points: 20,
      type: "lavafish",
    });

    // Shooting parameters
    this.shootCooldown = Math.max(1500, 2500 - difficultyMultiplier * 200);
    this.lastShotTime = 0;
    this.shootRange = 300; // Only shoots when within this range
    this.bulletSpeed = 200;

    // Movement behavior: keeps distance from player
    this.preferredDistance = 150;
  }

  update(time, delta, playerPos) {
    if (!this.isAlive || !this.sprite.active) return;

    // Flash effect
    if (this.flashTimer > 0) {
      this.flashTimer -= delta;
      if (this.flashTimer <= 0) this.sprite.clearTint();
    }

    const dist = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y, playerPos.x, playerPos.y
    );

    // Movement: try to maintain preferred distance
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y, playerPos.x, playerPos.y
    );

    if (dist > this.preferredDistance + 30) {
      // Too far — move closer
      this.sprite.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
    } else if (dist < this.preferredDistance - 30) {
      // Too close — back away
      this.sprite.setVelocity(
        Math.cos(angle) * -this.speed * 0.6,
        Math.sin(angle) * -this.speed * 0.6
      );
    } else {
      // At preferred distance — strafe
      this.sprite.setVelocity(
        Math.cos(angle + Math.PI / 2) * this.speed * 0.5,
        Math.sin(angle + Math.PI / 2) * this.speed * 0.5
      );
    }

    // Shooting
    if (dist <= this.shootRange && time - this.lastShotTime >= this.shootCooldown) {
      this.shoot(playerPos, angle);
      this.lastShotTime = time;
    }
  }

  /**
   * Shoot a fireball at the player.
   */
  shoot(playerPos, angle) {
    if (!this.scene.enemyBullets) return;

    const bullet = this.scene.enemyBullets.create(
      this.sprite.x, this.sprite.y, "enemy-bullet"
    );
    if (!bullet) return;

    bullet.setScale(2);
    bullet.damage = this.damage;
    bullet.setVelocity(
      Math.cos(angle) * this.bulletSpeed,
      Math.sin(angle) * this.bulletSpeed
    );

    // Auto-destroy after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      if (bullet.active) bullet.destroy();
    });
  }
}
