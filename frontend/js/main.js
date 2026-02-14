// main.js
// Entry point for Crustal Wars — initializes the Phaser game engine
// and registers all game scenes.

import Phaser from "phaser";
import BootScene from "./scenes/BootScene.js";
import MenuScene from "./scenes/MenuScene.js";
import GameScene from "./scenes/GameScene.js";
import GameOverScene from "./scenes/GameOverScene.js";
import LeaderboardScene from "./scenes/LeaderboardScene.js";

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 800,
  height: 600,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: "#0a0e1a",

  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [BootScene, MenuScene, GameScene, GameOverScene, LeaderboardScene],
};

const game = new Phaser.Game(config);
console.log("Crustal Wars — Phaser engine initialized!");
