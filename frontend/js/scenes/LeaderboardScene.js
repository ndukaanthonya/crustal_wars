// scenes/LeaderboardScene.js
// Two tabs: Global Leaderboard (individual players) and Team Leaderboard.
// Global: shows rank, name, wallet address (truncated), total score.
// Teams: shows team name, total points, and expandable member dropdown (3-4 members).
// Uses mock data for now — will connect to Supabase in Phase 7.

import Phaser from "phaser";

// === MOCK DATA — will be replaced with Supabase queries ===
const MOCK_GLOBAL_LEADERBOARD = [
  { rank: 1, name: "CryptoShark", wallet: "0x1a2B3c4D5e6F7890AbCdEf1234567890aBcDeF12", score: 15420 },
  { rank: 2, name: "OceanKing", wallet: "0x9f8E7d6C5b4A3210FeDcBa0987654321fEdCbA98", score: 12850 },
  { rank: 3, name: "TidalWave99", wallet: "0x2b3C4d5E6f7A8901BcDeF23456789AbCdEf0123", score: 11200 },
  { rank: 4, name: "DeepDiver", wallet: "0x3c4D5e6F7a8B9012CdEf34567890BcDeFa1234", score: 9870 },
  { rank: 5, name: "CoralCrusher", wallet: "0x4d5E6f7A8b9C0123DeFa45678901CdEfAb2345", score: 8540 },
  { rank: 6, name: "ReefRaider", wallet: "0x5e6F7a8B9c0D1234EfAb56789012DeFaBc3456", score: 7200 },
  { rank: 7, name: "AbyssWalker", wallet: "0x6f7A8b9C0d1E2345FaBc67890123EfAbCd4567", score: 6100 },
  { rank: 8, name: "KrakenSlayer", wallet: "0x7a8B9c0D1e2F3456AbCd78901234FaBcDe5678", score: 5320 },
  { rank: 9, name: "SeaPhantom", wallet: "0x8b9C0d1E2f3A4567BcDe89012345AbCdEf6789", score: 4800 },
  { rank: 10, name: "WaveBreaker", wallet: "0x9c0D1e2F3a4B5678CdEf90123456BcDeFA7890", score: 4150 },
];

const MOCK_TEAM_LEADERBOARD = [
  {
    rank: 1, name: "Abyss Predators", points: 38470, tag: "ABY",
    members: [
      { name: "CryptoShark", score: 15420, role: "Captain" },
      { name: "OceanKing", score: 12850, role: "Member" },
      { name: "TidalWave99", score: 11200, role: "Member" },
    ],
  },
  {
    rank: 2, name: "Coral Cartel", points: 31130, tag: "CCL",
    members: [
      { name: "DeepDiver", score: 9870, role: "Captain" },
      { name: "CoralCrusher", score: 8540, role: "Member" },
      { name: "ReefRaider", score: 7200, role: "Member" },
      { name: "NemoX", score: 5520, role: "Member" },
    ],
  },
  {
    rank: 3, name: "Kraken Krew", points: 24920, tag: "KRK",
    members: [
      { name: "KrakenSlayer", score: 5320, role: "Captain" },
      { name: "AbyssWalker", score: 6100, role: "Member" },
      { name: "SeaPhantom", score: 4800, role: "Member" },
      { name: "WaveBreaker", score: 4150, role: "Member" },
    ],
  },
  {
    rank: 4, name: "Tide Hunters", points: 18600, tag: "TDH",
    members: [
      { name: "ShellStorm", score: 7200, role: "Captain" },
      { name: "PearlDust", score: 6100, role: "Member" },
      { name: "MantaRay44", score: 5300, role: "Member" },
    ],
  },
  {
    rank: 5, name: "Depth Chargers", points: 14200, tag: "DPC",
    members: [
      { name: "SubZeroFin", score: 5500, role: "Captain" },
      { name: "BubbleWrap", score: 4800, role: "Member" },
      { name: "AnchorDrop", score: 3900, role: "Member" },
    ],
  },
];

export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super("LeaderboardScene");
  }

  init(data) {
    this.activeTab = data.tab || "global"; // "global" or "teams"
    this.expandedTeam = null; // Which team's dropdown is open
  }

  create() {
    const cx = this.cameras.main.width / 2;
    this.cameras.main.setBackgroundColor("#0a0e1a");

    // Store all rendered objects for tab switching
    this.tabObjects = { global: [], teams: [] };

    // === TITLE ===
    this.add.text(cx, 20, "LEADERBOARD", {
      fontSize: "24px", fontFamily: "Courier New", color: "#00ffcc", fontStyle: "bold",
    }).setOrigin(0.5);

    // === TAB BUTTONS ===
    this.createTabs(cx, 55);

    // === RENDER ACTIVE TAB ===
    this.renderGlobalTab();
    this.renderTeamsTab();
    this.showTab(this.activeTab);

    // === BACK BUTTON ===
    const backBg = this.add.rectangle(70, 20, 100, 28, 0x1a2a3a)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x4a6a8a);
    this.add.text(70, 20, "← MENU", {
      fontSize: "10px", fontFamily: "Courier New", color: "#aabbcc", fontStyle: "bold",
    }).setOrigin(0.5);

    backBg.on("pointerover", () => backBg.setFillStyle(0x222e3e));
    backBg.on("pointerout", () => backBg.setFillStyle(0x1a2a3a));
    backBg.on("pointerdown", () => this.scene.start("MenuScene"));

    // Keyboard
    this.input.keyboard.on("keydown-ESC", () => this.scene.start("MenuScene"));
  }

  // ============================================================
  // TAB BUTTONS
  // ============================================================
  createTabs(cx, y) {
    // Global tab
    this.globalTabBg = this.add.rectangle(cx - 90, y, 160, 30, 0x1a2a3a)
      .setInteractive({ useHandCursor: true });
    this.globalTabText = this.add.text(cx - 90, y, "🌍 GLOBAL", {
      fontSize: "11px", fontFamily: "Courier New", color: "#3498db", fontStyle: "bold",
    }).setOrigin(0.5);

    this.globalTabBg.on("pointerdown", () => {
      this.activeTab = "global";
      this.showTab("global");
    });

    // Teams tab
    this.teamsTabBg = this.add.rectangle(cx + 90, y, 160, 30, 0x1a2a3a)
      .setInteractive({ useHandCursor: true });
    this.teamsTabText = this.add.text(cx + 90, y, "👥 TEAMS", {
      fontSize: "11px", fontFamily: "Courier New", color: "#9b59b6", fontStyle: "bold",
    }).setOrigin(0.5);

    this.teamsTabBg.on("pointerdown", () => {
      this.activeTab = "teams";
      this.showTab("teams");
    });
  }

  showTab(tab) {
    // Highlight active tab
    if (tab === "global") {
      this.globalTabBg.setFillStyle(0x1a3a5f);
      this.globalTabBg.setStrokeStyle(2, 0x3498db);
      this.globalTabText.setColor("#ffffff");
      this.teamsTabBg.setFillStyle(0x1a2a3a);
      this.teamsTabBg.setStrokeStyle(0);
      this.teamsTabText.setColor("#9b59b6");
    } else {
      this.teamsTabBg.setFillStyle(0x2a1a4a);
      this.teamsTabBg.setStrokeStyle(2, 0x9b59b6);
      this.teamsTabText.setColor("#ffffff");
      this.globalTabBg.setFillStyle(0x1a2a3a);
      this.globalTabBg.setStrokeStyle(0);
      this.globalTabText.setColor("#3498db");
    }

    // Show/hide tab content
    this.tabObjects.global.forEach((obj) => obj.setVisible(tab === "global"));
    this.tabObjects.teams.forEach((obj) => obj.setVisible(tab === "teams"));
  }

  // ============================================================
  // GLOBAL LEADERBOARD TAB
  // ============================================================
  renderGlobalTab() {
    const cx = this.cameras.main.width / 2;
    const startY = 90;
    const rowH = 36;
    const objs = this.tabObjects.global;

    // Column headers
    const hdrStyle = { fontSize: "9px", fontFamily: "Courier New", color: "#4a6a8a" };
    objs.push(this.add.text(50, startY, "RANK", hdrStyle));
    objs.push(this.add.text(110, startY, "PLAYER", hdrStyle));
    objs.push(this.add.text(360, startY, "WALLET", hdrStyle));
    objs.push(this.add.text(700, startY, "SCORE", hdrStyle).setOrigin(1, 0));

    // Divider line
    const line = this.add.graphics();
    line.lineStyle(1, 0x1e3a5f, 0.5);
    line.lineBetween(40, startY + 16, 760, startY + 16);
    objs.push(line);

    // Player rows
    MOCK_GLOBAL_LEADERBOARD.forEach((player, i) => {
      const y = startY + 24 + i * rowH;
      const isTop3 = i < 3;

      // Row background (subtle alternating)
      const rowBg = this.add.rectangle(cx, y + 8, 720, rowH - 4, i % 2 === 0 ? 0x0f1a28 : 0x111e2e)
        .setAlpha(0.6);
      objs.push(rowBg);

      // Rank (with medals for top 3)
      const rankColors = ["#ffd700", "#c0c0c0", "#cd7f32"];
      const rankSymbols = ["🥇", "🥈", "🥉"];
      const rankText = isTop3 ? rankSymbols[i] : `#${player.rank}`;
      objs.push(this.add.text(55, y, rankText, {
        fontSize: isTop3 ? "14px" : "12px",
        fontFamily: "Courier New",
        color: isTop3 ? rankColors[i] : "#6a7a8a",
        fontStyle: "bold",
      }));

      // Player name
      objs.push(this.add.text(110, y + 2, player.name, {
        fontSize: "13px",
        fontFamily: "Courier New",
        color: isTop3 ? "#ffffff" : "#ccddee",
        fontStyle: isTop3 ? "bold" : "normal",
      }));

      // Wallet address (truncated: 0x1a2B...eF12)
      const truncWallet = player.wallet.slice(0, 6) + "..." + player.wallet.slice(-4);
      objs.push(this.add.text(360, y + 3, truncWallet, {
        fontSize: "10px",
        fontFamily: "Courier New",
        color: "#4a6a8a",
      }));

      // Score
      objs.push(this.add.text(700, y + 2, player.score.toLocaleString(), {
        fontSize: "13px",
        fontFamily: "Courier New",
        color: isTop3 ? "#00ffcc" : "#aabbcc",
        fontStyle: "bold",
      }).setOrigin(1, 0));
    });

    // Footer note
    objs.push(this.add.text(cx, 490, "Leaderboard updates after each match. Top players earn bonus $CRUST weekly.", {
      fontSize: "8px", fontFamily: "Courier New", color: "#3a4a5a",
    }).setOrigin(0.5));

    objs.push(this.add.text(cx, 505, "Team size: 3-4 players max", {
      fontSize: "8px", fontFamily: "Courier New", color: "#3a4a5a",
    }).setOrigin(0.5));
  }

  // ============================================================
  // TEAM LEADERBOARD TAB
  // ============================================================
  renderTeamsTab() {
    const cx = this.cameras.main.width / 2;
    const startY = 90;
    const objs = this.tabObjects.teams;

    // Headers
    const hdrStyle = { fontSize: "9px", fontFamily: "Courier New", color: "#4a6a8a" };
    objs.push(this.add.text(50, startY, "RANK", hdrStyle));
    objs.push(this.add.text(110, startY, "TEAM", hdrStyle));
    objs.push(this.add.text(430, startY, "MEMBERS", hdrStyle));
    objs.push(this.add.text(700, startY, "POINTS", hdrStyle).setOrigin(1, 0));

    const line = this.add.graphics();
    line.lineStyle(1, 0x1e3a5f, 0.5);
    line.lineBetween(40, startY + 16, 760, startY + 16);
    objs.push(line);

    // Team rows — each team is clickable to expand/collapse member list
    let currentY = startY + 24;

    MOCK_TEAM_LEADERBOARD.forEach((team, teamIndex) => {
      const teamY = currentY;
      const isTop3 = teamIndex < 3;

      // Team row background
      const rowBg = this.add.rectangle(cx, teamY + 8, 720, 34, teamIndex % 2 === 0 ? 0x0f1a28 : 0x111e2e)
        .setAlpha(0.6).setInteractive({ useHandCursor: true });
      objs.push(rowBg);

      // Rank
      const rankColors = ["#ffd700", "#c0c0c0", "#cd7f32"];
      const rankSymbols = ["🥇", "🥈", "🥉"];
      const rankText = isTop3 ? rankSymbols[teamIndex] : `#${team.rank}`;
      objs.push(this.add.text(55, teamY, rankText, {
        fontSize: isTop3 ? "14px" : "12px",
        fontFamily: "Courier New",
        color: isTop3 ? rankColors[teamIndex] : "#6a7a8a",
        fontStyle: "bold",
      }));

      // Team name + tag
      objs.push(this.add.text(110, teamY, `[${team.tag}]`, {
        fontSize: "10px", fontFamily: "Courier New", color: "#9b59b6",
      }));
      objs.push(this.add.text(155, teamY, team.name, {
        fontSize: "13px", fontFamily: "Courier New",
        color: isTop3 ? "#ffffff" : "#ccddee",
        fontStyle: isTop3 ? "bold" : "normal",
      }));

      // Member count
      objs.push(this.add.text(430, teamY + 2, `${team.members.length}/4 players`, {
        fontSize: "10px", fontFamily: "Courier New", color: "#6a7a8a",
      }));

      // Expand/collapse arrow
      const arrow = this.add.text(390, teamY + 1, "▼", {
        fontSize: "10px", fontFamily: "Courier New", color: "#9b59b6",
      });
      objs.push(arrow);

      // Points
      objs.push(this.add.text(700, teamY, team.points.toLocaleString(), {
        fontSize: "13px", fontFamily: "Courier New",
        color: isTop3 ? "#9b59b6" : "#aabbcc",
        fontStyle: "bold",
      }).setOrigin(1, 0));

      // === MEMBER DROPDOWN (hidden by default) ===
      const memberObjs = [];
      team.members.forEach((member, mi) => {
        const my = teamY + 30 + mi * 22;

        // Member row bg
        const mBg = this.add.rectangle(cx + 40, my + 4, 580, 20, 0x151e2e).setAlpha(0.8);
        memberObjs.push(mBg);
        objs.push(mBg);

        // Indent + role badge
        const roleColor = member.role === "Captain" ? "#ffd700" : "#4a6a8a";
        const roleBadge = member.role === "Captain" ? "★" : "·";
        memberObjs.push(
          this.add.text(150, my, roleBadge, { fontSize: "12px", fontFamily: "Courier New", color: roleColor })
        );
        objs.push(memberObjs[memberObjs.length - 1]);

        // Member name
        memberObjs.push(
          this.add.text(170, my, member.name, { fontSize: "11px", fontFamily: "Courier New", color: "#8a9aaa" })
        );
        objs.push(memberObjs[memberObjs.length - 1]);

        // Member score
        memberObjs.push(
          this.add.text(650, my, member.score.toLocaleString(), {
            fontSize: "11px", fontFamily: "Courier New", color: "#6a7a8a",
          }).setOrigin(1, 0)
        );
        objs.push(memberObjs[memberObjs.length - 1]);
      });

      // Hide members by default
      memberObjs.forEach((obj) => obj.setVisible(false));

      // Track expanded state per team
      let isExpanded = false;

      // Click to toggle dropdown
      rowBg.on("pointerdown", () => {
        isExpanded = !isExpanded;
        arrow.setText(isExpanded ? "▲" : "▼");
        memberObjs.forEach((obj) => obj.setVisible(isExpanded));
      });

      rowBg.on("pointerover", () => rowBg.setFillStyle(0x1a2a3f));
      rowBg.on("pointerout", () => rowBg.setFillStyle(teamIndex % 2 === 0 ? 0x0f1a28 : 0x111e2e));

      // Advance Y position (leave room for expanded members)
      currentY += 36 + team.members.length * 22;
    });

    // Footer
    objs.push(this.add.text(cx, 560, "Click a team to see members. Teams: 3-4 players max.", {
      fontSize: "8px", fontFamily: "Courier New", color: "#3a4a5a",
    }).setOrigin(0.5));
  }
}
