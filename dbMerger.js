const pg = require("pg");
const { Client } = pg;
require("dotenv").config();
const fs = require("fs");

const loadFile = (filePath) => {
  console.log("Loading players");
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log(`Error loading players: ${error}`);
    return {};
  }
};

let players = loadFile("players.json");

const run = async () => {
  // const client = new Client({
  //   user: process.env.SQL_USER,
  //   password: process.env.SQL_PASSWORD_CLOUD,
  //   host: process.env.SQL_HOST,
  //   port: 5432,
  //   database: process.env.SQL_DB,
  // });
  const client = new Client({
    user: "postgres",
    password: process.env.SQL_PASSWORD,
    host: "localhost",
    port: 5432,
    database: "aram-analyzer",
  });

  try {
    await client.connect();
  } catch (error) {
    console.error("Error connecting to the database:", error);
    return;
  }

  const updatePlayers = async () => {
    for (let player of Object.values(players)) {
      const query = `
      INSERT INTO Players (puuid, game_name, tag_line) 
      VALUES ('${player.puuid}', '${player.gameName}', '${player.tagLine}') 
      ON CONFLICT (puuid) DO UPDATE SET 
      game_name = Players.game_name || '' RETURNING *;`;
      try {
        const res = await client.query(query);
      } catch (error) {
        console.error("Error running query:", error);
      }
    }
  };

  const getPlayers = async () => {
    const query = "SELECT * FROM Players;";
    try {
      const res = await client.query(query);
      console.log(res.rows);
    } catch (error) {
      console.error("Error running query:", error);
    }
    try {
      await client.end();
    } catch (error) {
      console.error("Error disconnecting from the database:", error);
    }
  };

  const createTable = async () => {
    const tableQueries = [];

    // tableQueries.push(`
    // CREATE TABLE Champion_Averages (
    //   champ_name VARCHAR(255) NOT NULL,
    //   puuid VARCHAR(255) NOT NULL,
    //   damage REAL NOT NULL,
    //   gold REAL NOT NULL,
    //   cc REAL NOT NULL,
    //   healing REAL NOT NULL,
    //   shielding REAL NOT NULL,
    //   objective REAL NOT NULL,
    //   taken REAL NOT NULL,
    //   mitigated REAL NOT NULL,
    //   kills REAL NOT NULL,
    //   deaths REAL NOT NULL,
    //   assists REAL NOT NULL,
    //   kp REAL NOT NULL,
    //   damage_share REAL NOT NULL,
    //   gold_share REAL NOT NULL,
    //   kill_share REAL NOT NULL,
    //   kills_per_game REAL NOT NULL,
    //   deaths_per_game REAL NOT NULL,
    //   assists_per_game REAL NOT NULL,
    //   kda REAL NOT NULL,
    //   CONSTRAINT CHAMP_PLAYER_AVERAGES_KEY PRIMARY KEY (champ_name, puuid)
    // );`);

    // tableQueries.push(`
    // CREATE TABLE Champion_Totals (
    //   champ_name VARCHAR(255) NOT NULL,
    //   puuid VARCHAR(255) NOT NULL,
    //   wins INT NOT NULL,
    //   losses INT NOT NULL,
    //   damage INT NOT NULL,
    //   gold INT NOT NULL,
    //   cc INT NOT NULL,
    //   healing INT NOT NULL,
    //   shielding INT NOT NULL,
    //   objective INT NOT NULL,
    //   taken INT NOT NULL,
    //   mitigated INT NOT NULL,
    //   kills INT NOT NULL,
    //   deaths INT NOT NULL,
    //   assists INT NOT NULL,
    //   pentakills INT NOT NULL,
    //   quadrakills INT NOT NULL,
    //   triplekills INT NOT NULL,
    //   doublekills INT NOT NULL,
    //   kpm INT NOT NULL,
    //   CONSTRAINT CHAMP_PLAYER_TOTALS_KEY PRIMARY KEY (champ_name, puuid)
    // );`);

    // tableQueries.push(`
    // CREATE TABLE Champion_Highs (
    //   champ_name VARCHAR(255) NOT NULL,
    //   puuid VARCHAR(255) NOT NULL,
    //   most_kills_value INT NOT NULL,
    //   most_kills_match_id VARCHAR(255) NOT NULL,
    //   most_kills_date BIGINT NOT NULL,
    //   most_kills_champ VARCHAR(255),
    //   most_deaths_value INT NOT NULL,
    //   most_deaths_match_id VARCHAR(255) NOT NULL,
    //   most_deaths_date BIGINT NOT NULL,
    //   most_deaths_champ VARCHAR(255),
    //   most_assists_value INT NOT NULL,
    //   most_assists_match_id VARCHAR(255) NOT NULL,
    //   most_assists_date BIGINT NOT NULL,
    //   most_assists_champ VARCHAR(255),
    //   most_damage_value REAL NOT NULL,
    //   most_damage_match_id VARCHAR(255) NOT NULL,
    //   most_damage_date BIGINT NOT NULL,
    //   most_damage_champ VARCHAR(255),
    //   most_total_damage_value INT NOT NULL,
    //   most_total_damage_match_id VARCHAR(255) NOT NULL,
    //   most_total_damage_date BIGINT NOT NULL,
    //   most_total_damage_champ VARCHAR(255),
    //   most_gold_value REAL NOT NULL,
    //   most_gold_match_id VARCHAR(255) NOT NULL,
    //   most_gold_date BIGINT NOT NULL,
    //   most_gold_champ VARCHAR(255),
    //   most_total_gold_value INT NOT NULL,
    //   most_total_gold_match_id VARCHAR(255) NOT NULL,
    //   most_total_gold_date BIGINT NOT NULL,
    //   most_total_gold_champ VARCHAR(255),
    //   most_total_cs_value INT NOT NULL,
    //   most_total_cs_match_id VARCHAR(255) NOT NULL,
    //   most_total_cs_date BIGINT NOT NULL,
    //   most_total_cs_champ VARCHAR(255),
    //   most_cc_time_value REAL NOT NULL,
    //   most_cc_time_match_id VARCHAR(255) NOT NULL,
    //   most_cc_time_date BIGINT NOT NULL,
    //   most_cc_time_champ VARCHAR(255),
    //   most_total_cc_time_value INT NOT NULL,
    //   most_total_cc_time_match_id VARCHAR(255) NOT NULL,
    //   most_total_cc_time_date BIGINT NOT NULL,
    //   most_total_cc_time_champ VARCHAR(255),
    //   most_healing_value REAL NOT NULL,
    //   most_healing_match_id VARCHAR(255) NOT NULL,
    //   most_healing_date BIGINT NOT NULL,
    //   most_healing_champ VARCHAR(255),
    //   most_total_healing_value INT NOT NULL,
    //   most_total_healing_match_id VARCHAR(255) NOT NULL,
    //   most_total_healing_date BIGINT NOT NULL,
    //   most_total_healing_champ VARCHAR(255),
    //   most_shielding_value REAL NOT NULL,
    //   most_shielding_match_id VARCHAR(255) NOT NULL,
    //   most_shielding_date BIGINT NOT NULL,
    //   most_shielding_champ VARCHAR(255),
    //   most_total_shielding_value INT NOT NULL,
    //   most_total_shielding_match_id VARCHAR(255) NOT NULL,
    //   most_total_shielding_date BIGINT NOT NULL,
    //   most_total_shielding_champ VARCHAR(255),
    //   most_objective_value REAL NOT NULL,
    //   most_objective_match_id VARCHAR(255) NOT NULL,
    //   most_objective_date BIGINT NOT NULL,
    //   most_objective_champ  VARCHAR(255),
    //   most_total_objective_value INT NOT NULL,
    //   most_total_objective_match_id VARCHAR(255) NOT NULL,
    //   most_total_objective_date BIGINT NOT NULL,
    //   most_total_objective_champ VARCHAR(255),
    //   most_taken_value REAL NOT NULL,
    //   most_taken_match_id VARCHAR(255) NOT NULL,
    //   most_taken_date BIGINT NOT NULL,
    //   most_taken_champ VARCHAR(255),
    //   most_total_taken_value INT NOT NULL,
    //   most_total_taken_match_id VARCHAR(255) NOT NULL,
    //   most_total_taken_date BIGINT NOT NULL,
    //   most_total_taken_champ VARCHAR(255),
    //   most_mitigated_value REAL NOT NULL,
    //   most_mitigated_match_id VARCHAR(255) NOT NULL,
    //   most_mitigated_date BIGINT NOT NULL,
    //   most_mitigated_champ VARCHAR(255),
    //   most_total_mitigated_value INT NOT NULL,
    //   most_total_mitigated_match_id VARCHAR(255) NOT NULL,
    //   most_total_mitigated_date BIGINT NOT NULL,
    //   most_total_mitigated_champ VARCHAR(255),
    //   most_damage_share_value REAL NOT NULL,
    //   most_damage_share_match_id VARCHAR(255) NOT NULL,
    //   most_damage_share_date BIGINT NOT NULL,
    //   most_damage_share_champ VARCHAR(255),
    //   most_gold_share_value REAL NOT NULL,
    //   most_gold_share_match_id VARCHAR(255) NOT NULL,
    //   most_gold_share_date BIGINT NOT NULL,
    //   most_gold_share_champ VARCHAR(255),
    //   most_kill_participation_value REAL NOT NULL,
    //   most_kill_participation_match_id VARCHAR(255) NOT NULL,
    //   most_kill_participation_date BIGINT NOT NULL,
    //   most_kill_participation_champ VARCHAR(255),
    //   biggest_crit_value INT NOT NULL,
    //   biggest_crit_match_id VARCHAR(255) NOT NULL,
    //   biggest_crit_date BIGINT NOT NULL,
    //   biggest_crit_champ VARCHAR(255),
    //   biggest_killing_spree_value INT NOT NULL,
    //   biggest_killing_spree_match_id VARCHAR(255) NOT NULL,
    //   biggest_killing_spree_date BIGINT NOT NULL,
    //   biggest_killing_spree_champ VARCHAR(255),
    //   biggest_multi_kill_value INT NOT NULL,
    //   biggest_multi_kill_match_id VARCHAR(255) NOT NULL,
    //   biggest_multi_kill_date BIGINT NOT NULL,
    //   biggest_multi_kill_champ VARCHAR(255),
    //   longest_game_duration_value INT NOT NULL,
    //   longest_game_duration_match_id VARCHAR(255) NOT NULL,
    //   longest_game_duration_date BIGINT NOT NULL,
    //   longest_game_duration_champ VARCHAR(255),
    //   shortest_game_duration_value INT NOT NULL,
    //   shortest_game_duration_match_id VARCHAR(255) NOT NULL,
    //   shortest_game_duration_date BIGINT NOT NULL,
    //   shortest_game_duration_champ VARCHAR(255),
    //   CONSTRAINT CHAMP_HIGH_KEY PRIMARY KEY (champ_name, puuid)
    // );`);

    // const query = `
    // CREATE TABLE Matches (
    //   match_id VARCHAR(255) PRIMARY KEY,
    //   "dataVersion" VARCHAR(255) NOT NULL,
    //   "endOfGameResult" VARCHAR(255) NOT NULL,
    //   "gameCreation" BIGINT NOT NULL,
    //   "gameDuration" INT NOT NULL,
    //   "gameEndTimestamp" BIGINT NOT NULL,
    //   "gameId" BIGINT NOT NULL,
    //   "gameMode" VARCHAR(255) NOT NULL,
    //   "gameName" VARCHAR(255) NOT NULL,
    //   "gameStartTimestamp" BIGINT NOT NULL,
    //   "gameType" VARCHAR(255) NOT NULL,
    //   "gameVersion" VARCHAR(255) NOT NULL,
    //   "mapId" INT NOT NULL,
    //   "queueId" INT NOT NULL,
    //   "tournamentCode" VARCHAR(255)
    // );`;

    // tableQueries.push(`
    //   CREATE TABLE Players (
    //     puuid VARCHAR(255) PRIMARY KEY,
    //     game_name VARCHAR(255) NOT NULL,
    //     tag_line VARCHAR(255) NOT NULL,
    //     is_registered BOOLEAN DEFAULT FALSE
    // )`);

    // tableQueries.push(`
    //   CREATE TABLE Player_Matches (
    //     puuid VARCHAR(255) NOT NULL,
    //     match_id VARCHAR(255) NOT NULL,
    //     CONSTRAINT PLAYER_MATCH_KEY PRIMARY KEY (puuid, match_id)
    //   )`);

    // tableQueries.push(`
    //   CREATE TABLE Player_Analyzed_Matches (
    //     puuid VARCHAR(255) NOT NULL,
    //     match_id VARCHAR(255) NOT NULL,
    //     CONSTRAINT PLAYER_ANALYZED_MATCH_KEY PRIMARY KEY (puuid, match_id)
    //   )`);

    // tableQueries.push(`
    //   CREATE TABLE Participants (
    //     "match_id" VARCHAR(255) NOT NULL,
    //     "game_creation_time" BIGINT,
    //     "allInPings" INT,
    //     "assistMePings" INT,
    //     "assists" INT,
    //     "baronKills" INT,
    //     "basicPings" INT,
    //     "bountyLevel" INT,
    //     "challenges" JSON,
    //     "champExperience" INT,
    //     "champLevel" INT,
    //     "championId" INT,
    //     "championName" VARCHAR(255),
    //     "championTransform" INT,
    //     "commandPings" INT,
    //     "consumablesPurchased" INT,
    //     "damageDealtToBuildings" INT,
    //     "damageDealtToObjectives" INT,
    //     "damageDealtToTurrets" INT,
    //     "damageSelfMitigated" INT,
    //     "dangerPings" INT,
    //     "deaths" INT,
    //     "detectorWardsPlaced" INT,
    //     "doubleKills" INT,
    //     "dragonKills" INT,
    //     "eligibleForProgression" BOOLEAN,
    //     "enemyMissingPings" INT,
    //     "enemyVisionPings" INT,
    //     "firstBloodAssist" BOOLEAN,
    //     "firstBloodKill" BOOLEAN,
    //     "firstTowerAssist" BOOLEAN,
    //     "firstTowerKill" BOOLEAN,
    //     "gameEndedInEarlySurrender" BOOLEAN,
    //     "gameEndedInSurrender" BOOLEAN,
    //     "getBackPings" INT,
    //     "goldEarned" INT,
    //     "goldSpent" INT,
    //     "holdPings" INT,
    //     "individualPosition" VARCHAR(255),
    //     "inhibitorKills" INT,
    //     "inhibitorTakedowns" INT,
    //     "inhibitorsLost" INT,
    //     "item0" INT,
    //     "item1" INT,
    //     "item2" INT,
    //     "item3" INT,
    //     "item4" INT,
    //     "item5" INT,
    //     "item6" INT,
    //     "itemsPurchased" INT,
    //     "killingSprees" INT,
    //     "kills" INT,
    //     "lane" VARCHAR(255),
    //     "largestCriticalStrike" INT,
    //     "largestKillingSpree" INT,
    //     "largestMultiKill" INT,
    //     "longestTimeSpentLiving" INT,
    //     "magicDamageDealt" INT,
    //     "magicDamageDealtToChampions" INT,
    //     "magicDamageTaken" INT,
    //     "missions" JSON,
    //     "needVisionPings" INT,
    //     "neutralMinionsKilled" INT,
    //     "nexusKills" INT,
    //     "nexusLost" INT,
    //     "nexusTakedowns" INT,
    //     "objectivesStolen" INT,
    //     "objectivesStolenAssists" INT,
    //     "onMyWayPings" INT,
    //     "participantId" INT,
    //     "pentaKills" INT,
    //     "perks" JSON,
    //     "physicalDamageDealt" INT,
    //     "physicalDamageDealtToChampions" INT,
    //     "physicalDamageTaken" INT,
    //     "placement" INT,
    //     "playerAugment1" INT,
    //     "playerAugment2" INT,
    //     "playerAugment3" INT,
    //     "playerAugment4" INT,
    //     "playerSubteamId" INT,
    //     "profileIcon" INT,
    //     "pushPings" INT,
    //     "puuid" VARCHAR(255) NOT NULL,
    //     "quadraKills" INT,
    //     "riotIdGameName" VARCHAR(255),
    //     "riotIdTagline" VARCHAR(255),
    //     "role" VARCHAR(255),
    //     "sightWardsBoughtInGame" INT,
    //     "spell1Casts" INT,
    //     "spell2Casts" INT,
    //     "spell3Casts" INT,
    //     "spell4Casts" INT,
    //     "subteamPlacement" INT,
    //     "summoner1Casts" INT,
    //     "summoner1Id" INT,
    //     "summoner2Casts" INT,
    //     "summoner2Id" INT,
    //     "summonerId" VARCHAR(255),
    //     "summonerLevel" INT,
    //     "summonerName" VARCHAR(255),
    //     "teamEarlySurrendered" BOOLEAN,
    //     "teamId" INT,
    //     "teamPosition" VARCHAR(255),
    //     "timeCCingOthers" INT,
    //     "timePlayed" INT,
    //     "totalAllyJungleMinionsKilled" INT,
    //     "totalDamageDealt" INT,
    //     "totalDamageDealtToChampions" INT,
    //     "totalDamageShieldedOnTeammates" INT,
    //     "totalDamageTaken" INT,
    //     "totalEnemyJungleMinionsKilled" INT,
    //     "totalHeal" INT,
    //     "totalHealsOnTeammates" INT,
    //     "totalMinionsKilled" INT,
    //     "totalTimeCCDealt" INT,
    //     "totalTimeSpentDead" INT,
    //     "totalUnitsHealed" INT,
    //     "tripleKills" INT,
    //     "trueDamageDealt" INT,
    //     "trueDamageDealtToChampions" INT,
    //     "trueDamageTaken" INT,
    //     "turretKills" INT,
    //     "turretTakedowns" INT,
    //     "turretsLost" INT,
    //     "unrealKills" INT,
    //     "visionClearedPings" INT,
    //     "visionScore" INT,
    //     "visionWardsBoughtInGame" INT,
    //     "wardsKilled" INT,
    //     "wardsPlaced" INT,
    //     "win" BOOLEAN,
    //     CONSTRAINT PARTICIPANT_KEY PRIMARY KEY ("match_id", "puuid")
    // );`);

    // const query = `
    // CREATE TABLE Teams (
    //   "match_id" VARCHAR(255) PRIMARY KEY,
    //   "blue_bans" TEXT[],
    //   "blue_objectives_baron_first" BOOLEAN,
    //   "blue_objectives_baron_kills" INTEGER,
    //   "blue_objectives_champion_first" BOOLEAN,
    //   "blue_objectives_champion_kills" INTEGER,
    //   "blue_objectives_dragon_first" BOOLEAN,
    //   "blue_objectives_dragon_kills" INTEGER,
    //   "blue_objectives_horde_first" BOOLEAN,
    //   "blue_objectives_horde_kills" INTEGER,
    //   "blue_objectives_inhibitor_first" BOOLEAN,
    //   "blue_objectives_inhibitor_kills" INTEGER,
    //   "blue_objectives_riftHerald_first" BOOLEAN,
    //   "blue_objectives_riftHerald_kills" INTEGER,
    //   "blue_objectives_tower_first" BOOLEAN,
    //   "blue_objectives_tower_kills" INTEGER,
    //   "blue_teamId" INTEGER,
    //   "blue_win" BOOLEAN,
    //   "red_bans" TEXT[],
    //   "red_objectives_baron_first" BOOLEAN,
    //   "red_objectives_baron_kills" INTEGER,
    //   "red_objectives_champion_first" BOOLEAN,
    //   "red_objectives_champion_kills" INTEGER,
    //   "red_objectives_dragon_first" BOOLEAN,
    //   "red_objectives_dragon_kills" INTEGER,
    //   "red_objectives_horde_first" BOOLEAN,
    //   "red_objectives_horde_kills" INTEGER,
    //   "red_objectives_inhibitor_first" BOOLEAN,
    //   "red_objectives_inhibitor_kills" INTEGER,
    //   "red_objectives_riftHerald_first" BOOLEAN,
    //   "red_objectives_riftHerald_kills" INTEGER,
    //   "red_objectives_tower_first" BOOLEAN,
    //   "red_objectives_tower_kills" INTEGER,
    //   "red_teamId" INTEGER,
    //   "red_win" BOOLEAN
    // );`;

    // tableQueries.push(`
    // CREATE TABLE Player_Stats_Basic (
    //   puuid VARCHAR(255) PRIMARY KEY,
    //   wins INT NOT NULL,
    //   losses INT NOT NULL,
    //   last_updated_time BIGINT,
    //   current_streak INT NOT NULL,
    //   longest_win_streak INT NOT NULL,
    //   longest_loss_streak INT NOT NULL
    // );`);

    // tableQueries.push(`
    //   CREATE TABLE Class_Win_Rates (
    //     puuid VARCHAR(255) NOT NULL,
    //     class VARCHAR(255) NOT NULL,
    //     wins INT NOT NULL,
    //     losses INT NOT NULL,
    //     CONSTRAINT CLASS_WIN_RATES_KEY PRIMARY KEY (puuid, class)
    //   )`);

    // tableQueries.push(`
    //     CREATE TABLE Lineups (
    //       lineup_id VARCHAR(255) PRIMARY KEY,
    //       wins INT NOT NULL,
    //       losses INT NOT NULL,
    //       kills INT NOT NULL,
    //       deaths INT NOT NULL,
    //       average_game_time REAL NOT NULL,
    //       average_win_time REAL,
    //       average_loss_time REAL,
    //       average_damage REAL NOT NULL,
    //       average_damage_taken REAL NOT NULL
    //     )`);

    // tableQueries.push(`
    //     CREATE TABLE Lineup_Members (
    //       lineup_id VARCHAR(255) NOT NULL,
    //       puuid VARCHAR(255) NOT NULL,
    //       CONSTRAINT LINEUP_MEMBER_KEY PRIMARY KEY (lineup_id, puuid)
    //   )`);

    // tableQueries.push(`
    //     CREATE TABLE Lineup_Analyzed_Matches (
    //     lineup_id VARCHAR(255) NOT NULL,
    //     match_id VARCHAR(255) NOT NULL,
    //     CONSTRAINT LINEUP_MATCH_KEY PRIMARY KEY (lineup_id, match_id)
    // )`);

    // tableQueries.push(`
    //     CREATE TABLE Teammates (
    //       puuid VARCHAR(255) NOT NULL,
    //       teammate_puuid VARCHAR(255) NOT NULL,
    //       wins INT NOT NULL,
    //       losses INT NOT NULL,
    //       CONSTRAINT TEAMMATE_KEY PRIMARY KEY (puuid, teammate_puuid)
    // )`);

    for (const query of tableQueries) {
      try {
        const res = await client.query(query);
        console.log(res);
      } catch (error) {
        console.error("Error running query:", error);
      }
    }
  };

  const updateChampions = async () => {
    for (const player of Object.values(players)) {
      for (const [champName, champStatsObj] of Object.entries(
        player.champStats
      )) {
        const query = `
        INSERT INTO ChampionAverages (champ_name, puuid, damage, gold, cc, healing, shielding, objective, taken, mitigated, kills, deaths, assists, kp, damage_share, gold_share, kill_share, kills_per_game, deaths_per_game, assists_per_game, kda) 
        VALUES ('${champName}', '${player.puuid}', '${champStatsObj.stats.damagePerMinute}', '${champStatsObj.stats.goldPerMinute}', '${champStatsObj.stats.ccPerMinute}', '${champStatsObj.stats.healingPerMinute}', '${champStatsObj.stats.shieldingPerMinute}', '${champStatsObj.stats.objectiveDamagePerMinute}', '${champStatsObj.stats.damageTakenPerMinute}', '${champStatsObj.stats.selfMitigatedPerMinute}', '${champStatsObj.stats.killsPerMinute}', '${champStatsObj.stats.deathsPerMinute}', '${champStatsObj.stats.assistsPerMinute}', '${champStatsObj.stats.killParticipation}', '${champStatsObj.stats.damageShare}', '${champStatsObj.stats.goldShare}', '${champStatsObj.stats.killShare}', '${champStatsObj.stats.killsPerGame}', '${champStatsObj.stats.deathsPerGame}', '${champStatsObj.stats.assistsPerGame}', '${champStatsObj.stats.kda}')
        ON CONFLICT (champ_name, puuid) DO NOTHING;`;
        console.log(query);
        try {
          const res = await client.query(query);
        } catch (error) {
          console.error("Error running query:", error);
        }
      }
    }
  };

  async function addMatches() {
    const filenames = fs.readdirSync("saved_matches/");

    for (const filename of filenames) {
      if (filename == "matches_set.txt") continue;
      const data = JSON.parse(
        fs.readFileSync(`saved_matches/${filename}`, "utf-8")
      );
      if (data.info.participants.length == 0) continue;

      const matchId = filename.slice(0, -5);

      // ADDING MATCH INFO
      const query1 = `
        INSERT INTO Matches
          ( 
            "match_id", 
            "dataVersion", 
            "endOfGameResult", 
            "gameCreation", 
            "gameDuration", 
            "gameEndTimestamp", 
            "gameId", 
            "gameMode", 
            "gameName", 
            "gameStartTimestamp", 
            "gameType", 
            "gameVersion", 
            "mapId", 
            "queueId", 
            "tournamentCode" 
          )
        VALUES ('${filename.slice(0, -5)}', '${data.metadata.dataVersion}', '${
        data.info.endOfGameResult
      }', '${data.info.gameCreation}', '${data.info.gameDuration}', '${
        data.info.gameEndTimestamp
      }', '${data.info.gameId}', '${data.info.gameMode}', '${
        data.info.gameName
      }', '${data.info.gameStartTimestamp}', '${data.info.gameType}', '${
        data.info.gameVersion
      }', '${data.info.mapId}', '${data.info.queueId}', '${
        data.info.tournamentCode
      }')
        ON CONFLICT (match_id) DO NOTHING;
      `;

      try {
        console.log(query1);
        const res = await client.query(query1);
      } catch (error) {
        console.error("Error running query:", error);
        process.exit(1);
      }

      // ADDING PARTICIPANTS
      const participantWithMatchIds = data.info.participants.map(
        (participant) => {
          return { ...participant, match_id: filename.slice(0, -5) };
        }
      );
      const participantQueries = participantWithMatchIds.map((participant) => {
        const participantJson = JSON.stringify(participant);
        return `INSERT INTO Participants SELECT * FROM json_populate_record(NULL::Participants, '${participantJson.replace(
          /'/g,
          "''"
        )}') ON CONFLICT (match_id, puuid) DO NOTHING;`;
      });
      const playerAnalyzedMatchQueries = participantWithMatchIds.map(
        (participant) => {
          `INSERT INTO Player_Analyzed_Matches (puuid, match_id) VALUES ('${participant.puuid}', '${matchId}')`;
        }
      );
      for (const query of participantQueries) {
        try {
          const res = await client.query(query);
          console.log(res);
        } catch (error) {
          console.error("Error running query:", error);
          process.exit(1);
        }
      }
      for (const query of playerAnalyzedMatchQueries) {
        try {
          const res = await client.query(query);
          console.log(res);
        } catch (error) {
          console.error("Error running query:", error);
          process.exit(1);
        }
      }

      // ADDING TEAMS
      const query2 = `
        INSERT INTO Teams (
          match_id, 
          blue_bans, 
          blue_objectives_baron_first, 
          blue_objectives_baron_kills, 
          blue_objectives_champion_first, 
          blue_objectives_champion_kills, 
          blue_objectives_dragon_first, 
          blue_objectives_dragon_kills, 
          blue_objectives_horde_first, 
          blue_objectives_horde_kills, 
          blue_objectives_inhibitor_first, 
          blue_objectives_inhibitor_kills, 
          "blue_objectives_riftHerald_first", 
          "blue_objectives_riftHerald_kills", 
          blue_objectives_tower_first, 
          blue_objectives_tower_kills, 
          "blue_teamId", 
          blue_win, 
          red_bans, 
          red_objectives_baron_first, 
          red_objectives_baron_kills, 
          red_objectives_champion_first, 
          red_objectives_champion_kills, 
          red_objectives_dragon_first, 
          red_objectives_dragon_kills, 
          red_objectives_horde_first, 
          red_objectives_horde_kills, 
          red_objectives_inhibitor_first, 
          red_objectives_inhibitor_kills, 
          "red_objectives_riftHerald_first", 
          "red_objectives_riftHerald_kills", 
          red_objectives_tower_first, 
          red_objectives_tower_kills, 
          "red_teamId", 
          red_win
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)
        ON CONFLICT (match_id) DO NOTHING;
      `;

      // Prepare your data array from `data.info.teams[0]` and other sources
      const values = [
        filename.slice(0, -5), // match_id
        data.info.teams[0].bans.length > 0
          ? JSON.stringify(data.info.teams[0].bans)
          : "{}",
        data.info.teams[0].objectives.baron.first,
        data.info.teams[0].objectives.baron.kills,
        data.info.teams[0].objectives.champion.first,
        data.info.teams[0].objectives.champion.kills,
        data.info.teams[0].objectives.dragon.first,
        data.info.teams[0].objectives.dragon.kills,
        data.info.teams[0].objectives.horde?.first,
        data.info.teams[0].objectives.horde?.kills,
        data.info.teams[0].objectives.inhibitor.first,
        data.info.teams[0].objectives.inhibitor.kills,
        data.info.teams[0].objectives.riftHerald.first,
        data.info.teams[0].objectives.riftHerald.kills,
        data.info.teams[0].objectives.tower.first,
        data.info.teams[0].objectives.tower.kills,
        data.info.teams[0].teamId,
        data.info.teams[0].win,
        data.info.teams[1].bans.length > 0
          ? JSON.stringify(data.info.teams[1].bans)
          : "{}",
        data.info.teams[1].objectives.baron.first,
        data.info.teams[1].objectives.baron.kills,
        data.info.teams[1].objectives.champion.first,
        data.info.teams[1].objectives.champion.kills,
        data.info.teams[1].objectives.dragon.first,
        data.info.teams[1].objectives.dragon.kills,
        data.info.teams[1].objectives.horde?.first,
        data.info.teams[1].objectives.horde?.kills,
        data.info.teams[1].objectives.inhibitor.first,
        data.info.teams[1].objectives.inhibitor.kills,
        data.info.teams[1].objectives.riftHerald.first,
        data.info.teams[1].objectives.riftHerald.kills,
        data.info.teams[1].objectives.tower.first,
        data.info.teams[1].objectives.tower.kills,
        data.info.teams[1].teamId,
        data.info.teams[1].win,
      ];

      try {
        const res = await client.query(query2, values);
      } catch (error) {
        console.error("Error running query:", error);
        console.log(values);
        process.exit(1);
      }
    }
  }

  async function getData() {
    const query = "SELECT * FROM Players";
    try {
      const res = await client.query(query);
      console.log(res.rows);
    } catch (error) {
      console.error("Error running query:", error);
    }
  }

  await createTable();
  // await getPlayers();
  // await updateChampions();
  // await addMatches();
  // await getData();

  try {
    await client.end();
  } catch (error) {
    console.error("Error disconnecting from the database:", error);
  }
};

run();
