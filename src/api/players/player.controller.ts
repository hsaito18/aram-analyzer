import {
  UserData,
  Player,
  Players,
  ChampStats,
  SingleChampStats,
  DetailedChampStats,
  TotalChampStats,
  ChampHighs,
  PlayerHighs,
  TeamStats,
  PlayerStats,
  getBlankPlayerStats,
  getBlankChampHighs,
  getBlankAverageStats,
  getBlankTotalStats,
  ClassWinRates,
  PlayerInfo,
  PlayerStatsBasic,
} from "./player.interface";
import { Match, Participant } from "../matches/match.interface";
import {
  downloadMatches,
  getMatchData,
  getMatchParticipants,
  matches_set,
} from "../matches/match.controller";
import { analyzeMatchLineup } from "../lineups/lineup.controller";
import { mergeAverages, mergeTotals, mergeChampHighs } from "../object.service";
import { ChampionClasses, Classes } from "../../static/championClasses";
import { RIOT_API_KEY } from "../../config/API_KEY/apiConfig";
import { loadFile, saveFile } from "../fs.service";
import * as db from "../db/index";
import axios from "axios";
import log from "electron-log/main";
import { QueryResult } from "pg";

let status = "Ready!";

let players: Players = {};
const puuidData: { [key: string]: string } = {};

async function queryDB(
  query: string,
  values?: any[]
): Promise<QueryResult<any>> {
  try {
    return await db.query(query, values);
  } catch (error) {
    log.error(`Failed to query database: ${error}`);
    return null;
  }
}
export async function getUserData(
  gameName: string,
  tagLine: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
      },
    };
    axios
      .get(
        `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
        options
      )
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function getAllARAMs(puuid: string): Promise<string[]> {
  const allARAMs: string[] = [];
  let currBatch = await getARAMs(puuid, 100);
  let idx = 100;
  while (currBatch.length == 100) {
    allARAMs.push(...currBatch);
    currBatch = await getARAMs(puuid, 100, idx);
    idx += 100;
    log.info(`Got ${allARAMs.length} ARAMs`);
  }
  allARAMs.push(...currBatch);
  return allARAMs;
}

async function getARAMs(
  puuid: string,
  count: number,
  idx = 0
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
      },
    };
    axios
      .get(
        `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=450&start=${idx}&count=${count}`,
        options
      )
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export const findAll = async () => {
  const { rows } = await queryDB(
    "SELECT * FROM Players WHERE is_registered = TRUE"
  );
  return rows;
};

export const findOne = async (id: string) => {
  const { rows } = await queryDB("SELECT * FROM players WHERE puuid = $1", [
    id,
  ]);
  return rows[0];
};

export const puuidToName = async (puuid: string) => {
  const { rows } = await queryDB("SELECT * FROM players WHERE puuid = $1", [
    puuid,
  ]);
  if (rows.length == 1)
    return { gameName: rows[0]["game_name"], tagLine: rows[0]["tag_line"] };
  const res = await registerPuuid(puuid);
  if (!res) return { gameName: "unknown", tagLine: "" };
  return { gameName: res["game_name"], tagLine: res["tag_line"] };
};

function generateBlankClassWinRatesQueries(puuid: string): string[] {
  const queries = [];
  for (const champClass of Classes) {
    queries.push(
      `INSERT INTO Class_Win_Rates (puuid, class, wins, losses) 
      VALUES ('${puuid}', '${champClass}', 0, 0) 
      ON CONFLICT ON CONSTRAINT CLASS_WIN_RATES_KEY DO NOTHING`
    );
  }
  return queries;
}

export type CREATE_BY_USERNAME_RESPONSE =
  | UserData
  | "ALREADY_EXISTS"
  | "NOT_FOUND"
  | "BUSY";

export const createByUsername = async (
  userData: UserData
): Promise<CREATE_BY_USERNAME_RESPONSE> => {
  log.info(`Creating account for ${userData.gameName}#${userData.tagLine}`);
  try {
    const actualUserData = await getUserData(
      userData.gameName,
      userData.tagLine
    );
    // if (await isPlayerRegistered(actualUserData.puuid)) return "ALREADY_EXISTS";
    const playersQuery = `
      INSERT INTO Players (puuid, game_name, tag_line, is_registered) 
      VALUES ('${actualUserData.puuid}', '${actualUserData.gameName}', '${actualUserData.tagLine}', TRUE) 
      ON CONFLICT (puuid) DO UPDATE SET is_registered = TRUE`;

    const playerStatsBasicQuery = `
      INSERT INTO Player_Stats_Basic (
        puuid, 
        wins, 
        losses, 
        last_updated_time, 
        current_streak, 
        longest_win_streak, 
        longest_loss_streak 
      )
      VALUES ('${actualUserData.puuid}', 0, 0, 0, 0, 0, 0)
      ON CONFLICT (puuid) DO NOTHING`;

    await saveChampionStats(
      getBlankAverageStats(),
      getBlankTotalStats(),
      getBlankChampHighs(),
      actualUserData.puuid,
      "player",
      0,
      0
    );

    for (const query of [playersQuery, playerStatsBasicQuery]) {
      await queryDB(query);
    }
    const blankClassWinRatesQueries = generateBlankClassWinRatesQueries(
      actualUserData.puuid
    );
    for (const query of blankClassWinRatesQueries) {
      await queryDB(query);
    }
    players[actualUserData.puuid] = await loadPlayerData(actualUserData);
    return actualUserData;
  } catch (error) {
    console.error(`Failed to get PUUID: ${error}`);
    if (error.response.status === 429) {
      return "BUSY";
    }
    return "NOT_FOUND";
  }
};

export const findByUsername = async (userData: UserData) => {
  const allPlayers = Object.values(players);
  const searchedPlayer = allPlayers.find(
    (result) =>
      result.gameName.toLowerCase() === userData.gameName.toLowerCase() &&
      result.tagLine.toLowerCase() === userData.tagLine.toLowerCase()
  );
  if (!searchedPlayer) return await loadPlayerData(userData);
  return searchedPlayer;
};

export const isPlayerRegistered = async (
  userData: UserData
): Promise<boolean> => {
  const { rows } = await queryDB(
    "SELECT is_registered FROM Players WHERE game_name = $1 AND tag_line = $2",
    [userData.gameName, userData.tagLine]
  );
  if (rows.length == 0) return false;
  return rows[0]["is_registered"];
};

export const findPuuid = async (userData: UserData): Promise<string | null> => {
  const userKey = `${userData.gameName}#${userData.tagLine}`;
  if (userKey in puuidData) return puuidData[userKey];
  const { rows } = await queryDB(
    "SELECT puuid FROM players WHERE game_name = $1 AND tag_line = $2",
    [userData.gameName, userData.tagLine]
  );
  const puuid = rows[0]?.puuid || null;
  if (puuid !== null) puuidData[userKey] = puuid;
  return puuid;
};

export const getPlayerInfo = async (
  userData: UserData
): Promise<PlayerInfo | null> => {
  const { rows } = await queryDB(
    "SELECT * FROM players WHERE game_name = $1 AND tag_line = $2",
    [userData.gameName, userData.tagLine]
  );
  if (rows.length == 0) return null;
  return rows[0];
};

export const getPlayerBasicStats = async (
  puuid: string
): Promise<PlayerStatsBasic> => {
  const { rows } = await queryDB(
    "SELECT * FROM player_stats_basic WHERE puuid = $1",
    [puuid]
  );
  if (rows.length == 0)
    return {
      puuid: puuid,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalPlayed: 0,
      lastUpdatedTime: 0,
      results: [],
      lastTen: [],
      currentStreak: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
    };
  return {
    puuid: rows[0].puuid,
    wins: rows[0].wins,
    losses: rows[0].losses,
    winRate: (rows[0].wins / (rows[0].wins + rows[0].losses)) * 100,
    totalPlayed: rows[0].wins + rows[0].losses,
    lastUpdatedTime: rows[0].last_updated_time,
    results: rows[0].results,
    lastTen: rows[0].last_ten,
    currentStreak: rows[0].current_streak,
    longestWinStreak: rows[0].longest_win_streak,
    longestLossStreak: rows[0].longest_loss_streak,
  };
};

interface ChampionAverages extends DetailedChampStats {
  champName: string;
  puuid: string;
}
export const getChampionAverageStats = async (
  puuid: string
): Promise<ChampionAverages[]> => {
  const { rows } = await queryDB(
    "SELECT * FROM champion_averages WHERE puuid = $1",
    [puuid]
  );
  const out = [];
  for (const row of rows) {
    out.push({
      champName: row["champ_name"],
      puuid: row.puuid,
      damagePerMinute: row.damage,
      goldPerMinute: row.gold,
      ccPerMinute: row.cc,
      healingPerMinute: row.healing,
      shieldingPerMinute: row.shielding,
      objectiveDamagePerMinute: row.objective,
      damageTakenPerMinute: row.taken,
      selfMitigatedPerMinute: row.mitigated,
      killsPerMinute: row.kills,
      deathsPerMinute: row.deaths,
      assistsPerMinute: row.assists,
      killParticipation: row.kp,
      damageShare: row.damage_share,
      goldShare: row.gold_share,
      killShare: row.kill_share,
      killsPerGame: row.kills_per_game,
      deathsPerGame: row.deaths_per_game,
      assistsPerGame: row.assists_per_game,
      kda: row.kda,
    });
  }
  return out;
};

interface ChampionTotals extends TotalChampStats {
  champName: string;
  puuid: string;
  wins: number;
  losses: number;
}
export const getChampionTotalStats = async (
  puuid: string
): Promise<ChampionTotals[]> => {
  const { rows } = await queryDB(
    "SELECT * FROM champion_totals WHERE puuid = $1",
    [puuid]
  );
  const out = [];
  for (const row of rows) {
    out.push({
      champName: row["champ_name"],
      puuid: row.puuid,
      wins: row.wins,
      losses: row.losses,
      totalDamage: row.damage,
      totalGold: row.gold,
      totalCCTime: row.cc,
      totalHealing: row.healing,
      totalShielding: row.shielding,
      totalObjectiveDamage: row.objective,
      totalDamageTaken: row.taken,
      totalSelfMitigated: row.mitigated,
      totalKills: row.kills,
      totalDeaths: row.deaths,
      totalAssists: row.assists,
      pentakills: row.pentakills,
      quadrakills: row.quadrakills,
      triplekills: row.triplekills,
      doublekills: row.doublekills,
      killsPlusMinus: row.kpm,
    });
  }
  return out;
};

function convertChampHighs(row: any, champName: string): ChampionHighs {
  return {
    champName: champName,
    puuid: row.puuid,
    mostKills: {
      value: row["most_kills_value"],
      matchId: row["most_kills_match_id"],
      date: row["most_kills_date"],
      champName: row["most_kills_champ"] || champName,
    },
    mostDeaths: {
      value: row["most_deaths_value"],
      matchId: row["most_deaths_match_id"],
      date: row["most_deaths_date"],
      champName: row["most_deaths_champ"] || champName,
    },
    mostAssists: {
      value: row["most_assists_value"],
      matchId: row["most_assists_match_id"],
      date: row["most_assists_date"],
      champName: row["most_assists_champ"] || champName,
    },
    mostDamage: {
      value: row["most_damage_value"],
      matchId: row["most_damage_match_id"],
      date: row["most_damage_date"],
      champName: row["most_damage_champ"] || champName,
    },
    mostTotalDamage: {
      value: row["most_total_damage_value"],
      matchId: row["most_total_damage_match_id"],
      date: row["most_total_damage_date"],
      champName: row["most_total_damage_champ"] || champName,
    },
    mostGold: {
      value: row["most_gold_value"],
      matchId: row["most_gold_match_id"],
      date: row["most_gold_date"],
      champName: row["most_gold_champ"] || champName,
    },
    mostTotalGold: {
      value: row["most_total_gold_value"],
      matchId: row["most_total_gold_match_id"],
      date: row["most_total_gold_date"],
      champName: row["most_total_gold_champ"] || champName,
    },
    mostTotalCS: {
      value: row["most_total_cs_value"],
      matchId: row["most_total_cs_match_id"],
      date: row["most_total_cs_date"],
      champName: row["most_total_cs_champ"] || champName,
    },
    mostCCTime: {
      value: row["most_cc_time_value"],
      matchId: row["most_cc_time_match_id"],
      date: row["most_cc_time_date"],
      champName: row["most_cc_time_champ"] || champName,
    },
    mostTotalCCTime: {
      value: row["most_total_cc_time_value"],
      matchId: row["most_total_cc_time_match_id"],
      date: row["most_total_cc_time_date"],
      champName: row["most_total_cc_time_champ"] || champName,
    },
    mostHealing: {
      value: row["most_healing_value"],
      matchId: row["most_healing_match_id"],
      date: row["most_healing_date"],
      champName: row["most_healing_champ"] || champName,
    },
    mostTotalHealing: {
      value: row["most_total_healing_value"],
      matchId: row["most_total_healing_match_id"],
      date: row["most_total_healing_date"],
      champName: row["most_total_healing_champ"] || champName,
    },
    mostShielding: {
      value: row["most_shielding_value"],
      matchId: row["most_shielding_match_id"],
      date: row["most_shielding_date"],
      champName: row["most_shielding_champ"] || champName,
    },
    mostTotalShielding: {
      value: row["most_total_shielding_value"],
      matchId: row["most_total_shielding_match_id"],
      date: row["most_total_shielding_date"],
      champName: row["most_total_shielding_champ"] || champName,
    },
    mostObjectiveDamage: {
      value: row["most_objective_value"],
      matchId: row["most_objective_match_id"],
      date: row["most_objective_date"],
      champName: row["most_objective_champ"] || champName,
    },
    mostTotalObjectiveDamage: {
      value: row["most_total_objective_value"],
      matchId: row["most_total_objective_match_id"],
      date: row["most_total_objective_date"],
      champName: row["most_total_objective_champ"] || champName,
    },
    mostDamageTaken: {
      value: row["most_taken_value"],
      matchId: row["most_taken_match_id"],
      date: row["most_taken_date"],
      champName: row["most_taken_champ"] || champName,
    },
    mostTotalDamageTaken: {
      value: row["most_total_taken_value"],
      matchId: row["most_total_taken_match_id"],
      date: row["most_total_taken_date"],
      champName: row["most_total_taken_champ"] || champName,
    },
    mostSelfMitigated: {
      value: row["most_mitigated_value"],
      matchId: row["most_mitigated_match_id"],
      date: row["most_mitigated_date"],
      champName: row["most_mitigated_champ"] || champName,
    },
    mostTotalSelfMitigated: {
      value: row["most_total_mitigated_value"],
      matchId: row["most_total_mitigated_match_id"],
      date: row["most_total_mitigated_date"],
      champName: row["most_total_mitigated_champ"] || champName,
    },
    mostDamageShare: {
      value: row["most_damage_share_value"],
      matchId: row["most_damage_share_match_id"],
      date: row["most_damage_share_date"],
      champName: row["most_damage_share_champ"] || champName,
    },
    mostGoldShare: {
      value: row["most_gold_share_value"],
      matchId: row["most_gold_share_match_id"],
      date: row["most_gold_share_date"],
      champName: row["most_gold_share_champ"] || champName,
    },
    mostKillParticipation: {
      value: row["most_kill_participation_value"],
      matchId: row["most_kill_participation_match_id"],
      date: row["most_kill_participation_date"],
      champName: row["most_kill_participation_champ"] || champName,
    },
    biggestCrit: {
      value: row["biggest_crit_value"],
      matchId: row["biggest_crit_match_id"],
      date: row["biggest_crit_date"],
      champName: row["biggest_crit_champ"] || champName,
    },
    biggestMultikill: {
      value: row["biggest_multi_kill_value"],
      matchId: row["biggest_multi_kill_match_id"],
      date: row["biggest_multi_kill_date"],
      champName: row["biggest_multi_kill_champ"] || champName,
    },
    biggestKillingSpree: {
      value: row["biggest_killing_spree_value"],
      matchId: row["biggest_killing_spree_match_id"],
      date: row["biggest_killing_spree_date"],
      champName: row["biggest_killing_spree_champ"] || champName,
    },
    longestGame: {
      value: row["longest_game_duration_value"],
      matchId: row["longest_game_duration_match_id"],
      date: row["longest_game_duration_date"],
      champName: row["longest_game_duration_champ"] || champName,
    },
    shortestGame: {
      value: row["shortest_game_duration_value"],
      matchId: row["shortest_game_duration_match_id"],
      date: row["shortest_game_duration_date"],
      champName: row["shortest_game_duration_champ"] || champName,
    },
  };
}
interface ChampionHighs extends ChampHighs {
  champName: string;
  puuid: string;
}
export const getChampionHighs = async (
  puuid: string
): Promise<ChampionHighs[]> => {
  const { rows } = await queryDB(
    "SELECT * FROM champion_highs WHERE puuid = $1",
    [puuid]
  );
  const out: ChampionHighs[] = [];
  for (const row of rows) {
    const champName = row["champ_name"];
    out.push(convertChampHighs(row, champName));
  }
  return out;
};

export const getPlayerClassWinRates = async (
  puuid: string
): Promise<ClassWinRates> => {
  const { rows } = await queryDB(
    "SELECT * FROM class_win_rates WHERE puuid = $1",
    [puuid]
  );
  const classWinRates = rows.reduce(
    (acc, row) => ({
      ...acc,
      [row["class"]]: { wins: row.wins, losses: row.losses },
    }),
    {}
  );
  return classWinRates;
};

export const getPlayerTeammates = async (
  puuid: string
): Promise<{ [key: string]: { wins: number; losses: number } }> => {
  const { rows } = await queryDB("SELECT * FROM teammates WHERE puuid = $1", [
    puuid,
  ]);
  const teammates = rows.reduce(
    (acc, row) => ({
      ...acc,
      [row["teammate_puuid"]]: { wins: row.wins, losses: row.losses },
    }),
    {}
  );
  return teammates;
};

export const getPlayerMatches = async (
  puuid: string
): Promise<{ analyzedMatches: string[]; matches: string[] }> => {
  let { rows } = await queryDB(
    "SELECT match_id FROM player_matches WHERE puuid = $1",
    [puuid]
  );
  const matches = rows.map((row) => row["match_id"]);
  ({ rows } = await queryDB(
    "SELECT match_id FROM player_analyzed_matches WHERE puuid = $1",
    [puuid]
  ));
  const analyzedMatches = rows.map((row) => row["match_id"]);
  return { analyzedMatches, matches };
};

const getResults = async (puuid: string): Promise<boolean[]> => {
  const { rows } = await queryDB(
    `SELECT win FROM Participants WHERE puuid = '${puuid}' ORDER BY game_creation_time DESC`
  );
  return rows.map((row) => row.win);
};

const generatePlayerStats = async (
  puuid: string,
  playerAverageStats: DetailedChampStats,
  playerTotalStats: TotalChampStats,
  playerHighStats: ChampHighs
): Promise<PlayerStats> => {
  const playerBasicStats = await getPlayerBasicStats(puuid);
  const playerHighs: PlayerHighs = {
    ...playerHighStats,
    longestWinStreak: playerBasicStats.longestWinStreak,
    longestLossStreak: playerBasicStats.longestLossStreak,
  };
  const resultsBool = await getResults(puuid);
  const results = resultsBool.map((result) => (result ? 1 : 0));
  const lastTenWins = results.slice(0, 10).reduce((acc, curr) => acc + curr, 0);
  const lastTen = [lastTenWins, 10 - lastTenWins];
  const classWinRates = await getPlayerClassWinRates(puuid);
  const teammates = await getPlayerTeammates(puuid);
  return {
    wins: playerBasicStats.wins,
    losses: playerBasicStats.losses,
    winRate: playerBasicStats.winRate,
    totalPlayed: playerBasicStats.totalPlayed,
    lastUpdatedTime: playerBasicStats.lastUpdatedTime,
    results,
    lastTen,
    currentStreak: playerBasicStats.currentStreak,
    stats: playerAverageStats,
    totalStats: playerTotalStats,
    highs: playerHighs,
    classWinRates,
    teammates,
  };
};

const generateChampionStats = async (
  champAverageStats: ChampionAverages[],
  champTotalStats: ChampionTotals[],
  champHighStats: ChampionHighs[]
): Promise<ChampStats> => {
  const champStats: ChampStats = {};
  for (const champ of champAverageStats) {
    const champName = champ.champName;
    const champTotal = champTotalStats.find(
      (champ) => champ.champName === champName
    );
    let champHigh: ChampHighs = champHighStats.find(
      (champ) => champ.champName === champName
    );
    if (champHigh === undefined) {
      champHigh = getBlankChampHighs();
    }
    champStats[champName] = {
      wins: champTotal.wins,
      losses: champTotal.losses,
      winRate: (champTotal.wins / (champTotal.wins + champTotal.losses)) * 100,
      totalPlayed: champTotal.wins + champTotal.losses,
      stats: champ,
      totalStats: champTotal,
      highs: champHigh,
    };
  }
  return champStats;
};

export const loadPlayerData = async (
  userData: UserData
): Promise<Player | null> => {
  const puuid = await findPuuid(userData);
  if (puuid === null || !(await isPlayerRegistered(userData))) return null;
  const { analyzedMatches, matches } = await getPlayerMatches(puuid);
  const averageStats = await getChampionAverageStats(puuid);
  let playerAverageStats;
  const championAverageStats = [];
  for (const element of averageStats) {
    if (element.champName === "player") {
      playerAverageStats = element;
    } else {
      championAverageStats.push(element);
    }
  }
  const totalStats = await getChampionTotalStats(puuid);
  let playerTotalStats;
  const championTotalStats = [];
  for (const element of totalStats) {
    if (element.champName === "player") {
      playerTotalStats = element;
    } else {
      championTotalStats.push(element);
    }
  }

  const highStats = await getChampionHighs(puuid);
  let playerHighStats;
  const championHighStats = [];
  for (const element of highStats) {
    if (element.champName === "player") {
      playerHighStats = element;
    } else {
      championHighStats.push(element);
    }
  }

  const playerStats = await generatePlayerStats(
    puuid,
    playerAverageStats,
    playerTotalStats,
    playerHighStats
  );

  const champStats = await generateChampionStats(
    championAverageStats,
    championTotalStats,
    championHighStats
  );

  const player = {
    gameName: userData.gameName,
    tagLine: userData.tagLine,
    puuid,
    analyzedMatches,
    matches,
    playerStats,
    champStats,
    profileIcon: 0,
  };

  players[puuid] = player;
  return player;
};

const saveMatches = async (
  puuid: string,
  matches: string[],
  isAnalyzed: boolean
): Promise<void> => {
  const matchesEntries = matches.map((a) => `('${puuid}', '${a}')`);
  const matchesValues = matchesEntries.join(", ");
  const tableName = isAnalyzed ? "player_analyzed_matches" : "player_matches";
  const matchesQuery = `INSERT INTO ${tableName} (puuid, match_id) VALUES ${matchesValues} ON CONFLICT DO NOTHING`;
  await queryDB(matchesQuery);
};

const saveChampionStats = async (
  stats: DetailedChampStats,
  totalStats: TotalChampStats,
  highs: ChampHighs,
  puuid: string,
  champName: string,
  wins: number,
  losses: number
): Promise<void> => {
  const averagesUpdate = {
    champ_name: champName,
    puuid,
    damage: stats.damagePerMinute,
    gold: stats.goldPerMinute,
    cc: stats.ccPerMinute,
    healing: stats.healingPerMinute,
    shielding: stats.shieldingPerMinute,
    objective: stats.objectiveDamagePerMinute,
    taken: stats.damageTakenPerMinute,
    mitigated: stats.selfMitigatedPerMinute,
    kills: stats.killsPerMinute,
    deaths: stats.deathsPerMinute,
    assists: stats.assistsPerMinute,
    kp: stats.killParticipation,
    damage_share: stats.damageShare,
    gold_share: stats.goldShare,
    kill_share: stats.killShare,
    kills_per_game: stats.killsPerGame,
    deaths_per_game: stats.deathsPerGame,
    assists_per_game: stats.assistsPerGame,
    kda: stats.kda,
  };
  await db.upsertTable(
    "champion_averages",
    averagesUpdate,
    "champ_player_averages_key"
  );

  const totalsUpdate = {
    champ_name: champName,
    puuid,
    damage: totalStats.totalDamage,
    gold: totalStats.totalGold,
    wins,
    losses,
    cc: totalStats.totalCCTime,
    healing: totalStats.totalHealing,
    shielding: totalStats.totalShielding,
    objective: totalStats.totalObjectiveDamage,
    taken: totalStats.totalDamageTaken,
    mitigated: totalStats.totalSelfMitigated,
    kills: totalStats.totalKills,
    deaths: totalStats.totalDeaths,
    assists: totalStats.totalAssists,
    pentakills: totalStats.pentakills,
    quadrakills: totalStats.quadrakills,
    triplekills: totalStats.triplekills,
    doublekills: totalStats.doublekills,
    kpm: totalStats.killsPlusMinus,
  };
  await db.upsertTable(
    "champion_totals",
    totalsUpdate,
    "champ_player_totals_key"
  );

  // highs
  const highsUpdate = {
    champ_name: champName,
    puuid,
    most_kills_value: highs.mostKills.value,
    most_kills_match_id: highs.mostKills.matchId,
    most_kills_date: highs.mostKills.date,
    most_kills_champ: highs.mostKills.champName,
    most_deaths_value: highs.mostDeaths.value,
    most_deaths_match_id: highs.mostDeaths.matchId,
    most_deaths_date: highs.mostDeaths.date,
    most_deaths_champ: highs.mostDeaths.champName,
    most_assists_value: highs.mostAssists.value,
    most_assists_match_id: highs.mostAssists.matchId,
    most_assists_date: highs.mostAssists.date,
    most_assists_champ: highs.mostAssists.champName,
    most_damage_value: highs.mostDamage.value,
    most_damage_match_id: highs.mostDamage.matchId,
    most_damage_date: highs.mostDamage.date,
    most_damage_champ: highs.mostDamage.champName,
    most_total_damage_value: highs.mostTotalDamage.value,
    most_total_damage_match_id: highs.mostTotalDamage.matchId,
    most_total_damage_date: highs.mostTotalDamage.date,
    most_total_damage_champ: highs.mostTotalDamage.champName,
    most_gold_value: highs.mostGold.value,
    most_gold_match_id: highs.mostGold.matchId,
    most_gold_date: highs.mostGold.date,
    most_gold_champ: highs.mostGold.champName,
    most_total_gold_value: highs.mostTotalGold.value,
    most_total_gold_match_id: highs.mostTotalGold.matchId,
    most_total_gold_date: highs.mostTotalGold.date,
    most_total_gold_champ: highs.mostTotalGold.champName,
    most_total_cs_value: highs.mostTotalCS.value,
    most_total_cs_match_id: highs.mostTotalCS.matchId,
    most_total_cs_date: highs.mostTotalCS.date,
    most_total_cs_champ: highs.mostTotalCS.champName,
    most_cc_time_value: highs.mostCCTime.value,
    most_cc_time_match_id: highs.mostCCTime.matchId,
    most_cc_time_date: highs.mostCCTime.date,
    most_cc_time_champ: highs.mostCCTime.champName,
    most_total_cc_time_value: highs.mostTotalCCTime.value,
    most_total_cc_time_match_id: highs.mostTotalCCTime.matchId,
    most_total_cc_time_date: highs.mostTotalCCTime.date,
    most_total_cc_time_champ: highs.mostTotalCCTime.champName,
    most_healing_value: highs.mostHealing.value,
    most_healing_match_id: highs.mostHealing.matchId,
    most_healing_date: highs.mostHealing.date,
    most_healing_champ: highs.mostHealing.champName,
    most_total_healing_value: highs.mostTotalHealing.value,
    most_total_healing_match_id: highs.mostTotalHealing.matchId,
    most_total_healing_date: highs.mostTotalHealing.date,
    most_total_healing_champ: highs.mostTotalHealing.champName,
    most_shielding_value: highs.mostShielding.value,
    most_shielding_match_id: highs.mostShielding.matchId,
    most_shielding_date: highs.mostShielding.date,
    most_shielding_champ: highs.mostShielding.champName,
    most_total_shielding_value: highs.mostTotalShielding.value,
    most_total_shielding_match_id: highs.mostTotalShielding.matchId,
    most_total_shielding_date: highs.mostTotalShielding.date,
    most_total_shielding_champ: highs.mostTotalShielding.champName,
    most_objective_value: highs.mostObjectiveDamage.value,
    most_objective_match_id: highs.mostObjectiveDamage.matchId,
    most_objective_date: highs.mostObjectiveDamage.date,
    most_objective_champ: highs.mostObjectiveDamage.champName,
    most_total_objective_value: highs.mostTotalObjectiveDamage.value,
    most_total_objective_match_id: highs.mostTotalObjectiveDamage.matchId,
    most_total_objective_date: highs.mostTotalObjectiveDamage.date,
    most_total_objective_champ: highs.mostTotalObjectiveDamage.champName,
    most_taken_value: highs.mostDamageTaken.value,
    most_taken_match_id: highs.mostDamageTaken.matchId,
    most_taken_date: highs.mostDamageTaken.date,
    most_taken_champ: highs.mostDamageTaken.champName,
    most_total_taken_value: highs.mostTotalDamageTaken.value,
    most_total_taken_match_id: highs.mostTotalDamageTaken.matchId,
    most_total_taken_date: highs.mostTotalDamageTaken.date,
    most_total_taken_champ: highs.mostTotalDamageTaken.champName,
    most_mitigated_value: highs.mostSelfMitigated.value,
    most_mitigated_match_id: highs.mostSelfMitigated.matchId,
    most_mitigated_date: highs.mostSelfMitigated.date,
    most_mitigated_champ: highs.mostSelfMitigated.champName,
    most_total_mitigated_value: highs.mostTotalSelfMitigated.value,
    most_total_mitigated_match_id: highs.mostTotalSelfMitigated.matchId,
    most_total_mitigated_date: highs.mostTotalSelfMitigated.date,
    most_total_mitigated_champ: highs.mostTotalSelfMitigated.champName,
    most_damage_share_value: highs.mostDamageShare.value,
    most_damage_share_match_id: highs.mostDamageShare.matchId,
    most_damage_share_date: highs.mostDamageShare.date,
    most_damage_share_champ: highs.mostDamageShare.champName,
    most_gold_share_value: highs.mostGoldShare.value,
    most_gold_share_match_id: highs.mostGoldShare.matchId,
    most_gold_share_date: highs.mostGoldShare.date,
    most_gold_share_champ: highs.mostGoldShare.champName,
    most_kill_participation_value: highs.mostKillParticipation.value,
    most_kill_participation_match_id: highs.mostKillParticipation.matchId,
    most_kill_participation_date: highs.mostKillParticipation.date,
    most_kill_participation_champ: highs.mostKillParticipation.champName,
    biggest_crit_value: highs.biggestCrit.value,
    biggest_crit_match_id: highs.biggestCrit.matchId,
    biggest_crit_date: highs.biggestCrit.date,
    biggest_crit_champ: highs.biggestCrit.champName,
    biggest_multi_kill_value: highs.biggestMultikill.value,
    biggest_multi_kill_match_id: highs.biggestMultikill.matchId,
    biggest_multi_kill_date: highs.biggestMultikill.date,
    biggest_multi_kill_champ: highs.biggestMultikill.champName,
    biggest_killing_spree_value: highs.biggestKillingSpree.value,
    biggest_killing_spree_match_id: highs.biggestKillingSpree.matchId,
    biggest_killing_spree_date: highs.biggestKillingSpree.date,
    biggest_killing_spree_champ: highs.biggestKillingSpree.champName,
    longest_game_duration_value: highs.longestGame.value,
    longest_game_duration_match_id: highs.longestGame.matchId,
    longest_game_duration_date: highs.longestGame.date,
    longest_game_duration_champ: highs.longestGame.champName,
    shortest_game_duration_value: highs.shortestGame.value,
    shortest_game_duration_match_id: highs.shortestGame.matchId,
    shortest_game_duration_date: highs.shortestGame.date,
    shortest_game_duration_champ: highs.shortestGame.champName,
  };

  await db.upsertTable("champion_highs", highsUpdate, "champ_high_key");
};

export const savePlayerData = async (player: Player): Promise<void> => {
  // matches
  saveMatches(player.puuid, player.matches, false);
  // analyzed matches
  saveMatches(player.puuid, player.analyzedMatches, true);
  // player_stats_basic
  const playerStatsBasicUpdate = {
    puuid: player.puuid,
    wins: player.playerStats.wins,
    losses: player.playerStats.losses,
    last_updated_time: player.playerStats.lastUpdatedTime,
    current_streak: player.playerStats.currentStreak,
    longest_win_streak: player.playerStats.highs.longestWinStreak,
    longest_loss_streak: player.playerStats.highs.longestLossStreak,
  };
  await db.upsertTable(
    "player_stats_basic",
    playerStatsBasicUpdate,
    "player_stats_basic_pkey"
  );
  // player_stats
  await saveChampionStats(
    player.playerStats.stats,
    player.playerStats.totalStats,
    player.playerStats.highs,
    player.puuid,
    "player",
    player.playerStats.wins,
    player.playerStats.losses
  );
  // champion_stats
  for (const champName of Object.keys(player.champStats)) {
    const champ = player.champStats[champName];
    await saveChampionStats(
      champ.stats,
      champ.totalStats,
      champ.highs,
      player.puuid,
      champName,
      champ.wins,
      champ.losses
    );
  }
  // teammates
  for (const teammate of Object.keys(player.playerStats.teammates)) {
    const { wins, losses } = player.playerStats.teammates[teammate];
    await db.upsertTable(
      "teammates",
      { wins, losses, puuid: player.puuid, teammate_puuid: teammate },
      "teammate_key"
    );
  }

  // class win rates
  for (const [className, classWR] of Object.entries(
    player.playerStats.classWinRates
  )) {
    await db.upsertTable(
      "class_win_rates",
      {
        wins: classWR.wins,
        losses: classWR.losses,
        class: className,
        puuid: player.puuid,
      },
      "class_win_rates_key"
    );
  }
  players[player.puuid] = player;
};

export const remove = async (id: string): Promise<void> => {
  const queries = [];
  queries.push(`DELETE FROM Players WHERE puuid = '${id}'`);
  queries.push(`DELETE FROM Players_Stats_Basic WHERE puuid = '${id}'`);
  queries.push(`DELETE FROM Player_Matches WHERE puuid = '${id}'`);
  queries.push(`DELETE FROM Player_Analyzed_Matches WHERE puuid = '${id}'`);
  queries.push(`DELETE FROM Champion_Averages WHERE puuid = '${id}'`);
  queries.push(`DELETE FROM Champion_Totals WHERE puuid = '${id}'`);
  queries.push(`DELETE FROM Champion_Highs WHERE puuid = '${id}'`);
  queries.push(`DELETE FROM Class_Win_Rates WHERE puuid = '${id}'`);
  queries.push(`DELETE FROM Teammates WHERE puuid = '${id}'`);
  queries.push(`DELETE FROM a WHERE puuid = '${id}'`);
  for (const query of queries) {
    const res = await queryDB(query);
    const table = query.split(" ")[2];
    log.info(`Deleted ${res.rowCount} rows from ${table}`);
  }
};

export const saveARAMMatches = async (
  userData: UserData
): Promise<string[] | string> => {
  let player = await findByUsername(userData);
  if (!player) {
    player = await loadPlayerData(userData);
    if (player === null) {
      return "NOT_FOUND";
    }
  }
  const puuid = player.puuid;
  status = `Getting ARAMs for ${player.gameName}#${player.tagLine}`;
  const matches = await getAllARAMs(puuid);
  player.matches = [...new Set([...matches, ...player.matches])];
  await saveMatches(puuid, player.matches, false);
  status = "Ready!";
  log.info(`Done finding ARAMs for ${player.gameName}#${player.tagLine}`);
  return player.matches;
};

function getTeamStats(match: Match, teamId: number): TeamStats {
  let totalKills = 0;
  let totalDamage = 0;
  let totalDamageTaken = 0;
  let totalGold = 0;
  let totalDeaths = 0;
  for (const participant of match.info.participants) {
    if (participant.teamId === teamId) {
      totalKills += participant.kills;
      totalDamage += participant.totalDamageDealtToChampions;
      totalDamageTaken += participant.totalDamageTaken;
      totalGold += participant.goldEarned;
      totalDeaths += participant.deaths;
    }
  }
  const out: TeamStats = {
    totalKills,
    totalDamage,
    totalDamageTaken,
    totalGold,
    totalDeaths,
  };
  return out;
}

function getDetailedChampStats(
  participant: Participant,
  team: TeamStats
): DetailedChampStats {
  const minutes = participant.timePlayed / 60;
  return {
    damagePerMinute: participant.totalDamageDealtToChampions / minutes,
    goldPerMinute: participant.goldEarned / minutes,
    ccPerMinute: participant.timeCCingOthers / minutes,
    healingPerMinute: participant.totalHeal / minutes,
    shieldingPerMinute: participant.totalDamageShieldedOnTeammates / minutes,
    objectiveDamagePerMinute: participant.damageDealtToObjectives / minutes,
    damageTakenPerMinute: participant.totalDamageTaken / minutes,
    selfMitigatedPerMinute: participant.damageSelfMitigated / minutes,
    killsPerMinute: participant.kills / minutes,
    deathsPerMinute: participant.deaths / minutes,
    assistsPerMinute: participant.assists / minutes,
    killParticipation:
      (participant.kills + participant.assists) / (team.totalKills || 1),
    damageShare: participant.totalDamageDealtToChampions / team.totalDamage,
    goldShare: participant.goldEarned / (team.totalGold || 1),
    killShare: participant.kills / (team.totalKills || 1),
    killsPerGame: participant.kills,
    deathsPerGame: participant.deaths,
    assistsPerGame: participant.assists,
    kda: (participant.kills + participant.assists) / (participant.deaths || 1),
  };
}

function getMatchTotalStats(
  participant: Participant,
  killsPlusMinus: number
): TotalChampStats {
  return {
    totalDamage: participant.totalDamageDealtToChampions,
    totalGold: participant.goldEarned,
    totalCCTime: participant.timeCCingOthers,
    totalHealing: participant.totalHeal,
    totalShielding: participant.totalDamageShieldedOnTeammates,
    totalObjectiveDamage: participant.damageDealtToObjectives,
    totalDamageTaken: participant.totalDamageTaken,
    totalSelfMitigated: participant.damageSelfMitigated,
    totalKills: participant.kills,
    totalDeaths: participant.deaths,
    totalAssists: participant.assists,
    pentakills: participant.pentaKills,
    quadrakills: participant.quadraKills,
    triplekills: participant.tripleKills,
    doublekills: participant.doubleKills,
    killsPlusMinus,
  };
}

function getMatchHighs(
  matchTotalStats: TotalChampStats,
  detailedChampStats: DetailedChampStats,
  participant: Participant,
  matchId: string,
  date: number
): ChampHighs {
  return {
    mostKills: {
      value: matchTotalStats.totalKills,
      matchId,
      date,
      champName: participant.championName,
    },
    mostDeaths: {
      value: matchTotalStats.totalDeaths,
      matchId,
      date,
      champName: participant.championName,
    },
    mostAssists: {
      value: matchTotalStats.totalAssists,
      matchId,
      date,
      champName: participant.championName,
    },
    mostDamage: {
      value: detailedChampStats.damagePerMinute,
      matchId,
      date,
      champName: participant.championName,
    },
    mostTotalDamage: {
      value: matchTotalStats.totalDamage,
      matchId,
      date,
      champName: participant.championName,
    },
    mostGold: {
      value: detailedChampStats.goldPerMinute,
      matchId,
      date,
      champName: participant.championName,
    },
    mostTotalGold: {
      value: matchTotalStats.totalGold,
      matchId,
      date,
      champName: participant.championName,
    },
    mostTotalCS: {
      value: participant.totalMinionsKilled,
      matchId,
      date,
      champName: participant.championName,
    },
    mostCCTime: {
      value: detailedChampStats.ccPerMinute,
      matchId,
      date,
      champName: participant.championName,
    },
    mostHealing: {
      value: detailedChampStats.healingPerMinute,
      matchId,
      date,
      champName: participant.championName,
    },
    mostShielding: {
      value: detailedChampStats.shieldingPerMinute,
      matchId,
      date,
      champName: participant.championName,
    },
    mostDamageShare: {
      value: detailedChampStats.damageShare,
      matchId,
      date,
      champName: participant.championName,
    },
    mostGoldShare: {
      value: detailedChampStats.goldShare,
      matchId,
      date,
      champName: participant.championName,
    },
    mostDamageTaken: {
      value: detailedChampStats.damageTakenPerMinute,
      matchId,
      date,
      champName: participant.championName,
    },
    mostObjectiveDamage: {
      value: detailedChampStats.objectiveDamagePerMinute,
      matchId,
      date,
      champName: participant.championName,
    },
    mostKillParticipation: {
      value: detailedChampStats.killParticipation,
      matchId,
      date,
      champName: participant.championName,
    },
    mostSelfMitigated: {
      value: detailedChampStats.selfMitigatedPerMinute,
      matchId,
      date,
      champName: participant.championName,
    },
    mostTotalCCTime: {
      value: matchTotalStats.totalCCTime,
      matchId,
      date,
      champName: participant.championName,
    },
    mostTotalHealing: {
      value: matchTotalStats.totalHealing,
      matchId,
      date,
      champName: participant.championName,
    },
    mostTotalShielding: {
      value: matchTotalStats.totalShielding,
      matchId,
      date,
      champName: participant.championName,
    },
    mostTotalObjectiveDamage: {
      value: matchTotalStats.totalObjectiveDamage,
      matchId,
      date,
      champName: participant.championName,
    },
    mostTotalDamageTaken: {
      value: matchTotalStats.totalDamageTaken,
      matchId,
      date,
      champName: participant.championName,
    },
    mostTotalSelfMitigated: {
      value: matchTotalStats.totalSelfMitigated,
      matchId,
      date,
      champName: participant.championName,
    },
    biggestCrit: {
      value: participant.largestCriticalStrike,
      matchId,
      date,
      champName: participant.championName,
    },
    biggestKillingSpree: {
      value: participant.largestKillingSpree,
      matchId,
      date,
      champName: participant.championName,
    },
    biggestMultikill: {
      value: participant.largestMultiKill,
      matchId,
      date,
      champName: participant.championName,
    },
    longestGame: {
      value: participant.timePlayed,
      matchId,
      date,
      champName: participant.championName,
    },
    shortestGame: {
      value: participant.timePlayed,
      matchId,
      date,
      champName: participant.championName,
    },
  };
}

// async function updateProfileIcon(player: Player): Promise<void> {
//   if (player.matches.length == 0) return;
//   const latestMatch = player.matches[0];
//   const matchData = await getMatchData(latestMatch);
//   if (!matchData) {
//     player.matches.shift();
//     updateProfileIcon(player);
//     return;
//   }
//   const participant = matchData.info.participants.find(
//     (participant: any) => participant.puuid === player.puuid
//   );
//   if (!participant) {
//     player.matches.shift();
//     updateProfileIcon(player);
//     return;
//   }
//   players[player.puuid].profileIcon = participant.profileIcon;
//   saveFile(playersFilePath, players);
// }

// TODO: add LotQD analysis
function analyzeWinStreaks(results: number[]): {
  longestWinStreak: number;
  longestLossStreak: number;
  lastTenRecord: number[];
  currentStreak: { isWinStreak: boolean; length: number };
} {
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;

  let lastTenWins = 0;

  const firstResult = results[0];
  const currentStreakType = firstResult == 1;
  let isCurrentWinStreakDone = false;
  let currentStreakLength = 1;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (i < 10) {
      lastTenWins += result;
    }
    if (i > 0 && !isCurrentWinStreakDone) {
      if (result == firstResult) {
        currentStreakLength++;
      } else {
        isCurrentWinStreakDone = true;
      }
    }
    if (result == 1) {
      currentWinStreak++;
      currentLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    } else {
      currentLossStreak++;
      currentWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
    }
  }
  const lastTenLosses = 10 - lastTenWins;
  const lastTenRecord = [lastTenWins, lastTenLosses];
  const currentStreak = {
    isWinStreak: currentStreakType,
    length: currentStreakLength,
  };
  return { longestWinStreak, longestLossStreak, lastTenRecord, currentStreak };
}

const getTeammates = (
  matchData: Match,
  puuid: string,
  teamId: number
): string[] => {
  const teammates = [];
  for (const participant of matchData.info.participants) {
    if (participant.puuid === puuid || participant.teamId !== teamId) continue;
    teammates.push(participant.puuid);
  }
  return teammates;
};

async function registerPuuid(puuid: string) {
  const options = {
    method: "GET",
    headers: {
      "X-Riot-Token": RIOT_API_KEY,
    },
  };
  const response = await axios
    .get(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
      options
    )
    .catch((error) => {
      if (error.response.status === 429) {
        return 2;
      }
      return 1;
    });
  if (response == 2) return false;
  if (response == 1) throw new Error(`Error registering puuid ${puuid}`);
  const userData = response?.data;
  delete userData["puuid"];
  if (userData !== null) {
    const { rows } = await queryDB(
      "INSERT INTO Players (puuid, game_name, tag_line) VALUES ($1, $2, $3) RETURNING *",
      [puuid, userData.gameName, userData.tagLine]
    );
    return rows[0];
  }
  return false;
}

export const analyzePlayerMatches = async (
  userData: UserData
): Promise<boolean> => {
  log.info(`Analyzing matches for ${userData.gameName}...`);
  const puuid = await findPuuid(userData);
  if (!puuid) return false;
  const { analyzedMatches, matches } = await getPlayerMatches(puuid);
  if (analyzedMatches.length === matches.length) return true;
  const player = await loadPlayerData(userData);
  if (!player) return false;
  // await updateProfileIcon(player);
  const champStats: ChampStats = player.champStats;
  const playerStats: PlayerStats = player.playerStats;
  status = `Downloading matches for ${player.gameName}#${player.tagLine}...`;
  await downloadMatches(player.matches);
  status = `Analyzing matches for ${player.gameName}#${player.tagLine}...`;
  // vv Maybe we can rewrite this with another SQL request every time. vv
  const currentResults = []; // This should work as long as all the games that have not been analyzed are all newer than all the analyzed games
  for (const match of player.matches) {
    if (player.analyzedMatches.includes(match)) continue;
    const matchData = await getMatchData(match);
    if (!matchData) continue;
    if (matchData.info.participants.length < 1) continue;
    if (matchData.info.participants[0].gameEndedInEarlySurrender) {
      player.analyzedMatches.push(match);
      continue;
    }
    const participant = matchData?.info?.participants?.find(
      (participant: any) => participant.puuid === player.puuid
    );
    if (!participant) continue;
    const win = participant.win;
    const champion = participant.championName;
    const teamId = participant.teamId;
    const teamStats = getTeamStats(matchData, teamId);
    const teammates = getTeammates(matchData, player.puuid, participant.teamId);
    await analyzeMatchLineup(
      teammates,
      win,
      match,
      player.puuid,
      teamStats,
      matchData.info.gameDuration
    );
    // await puuidMapRegisterTeammates(teammates);
    const teammatesWinObject = teammates.reduce((obj, teammate) => {
      obj[teammate] = {
        wins: win ? 1 : 0,
        losses: win ? 0 : 1,
      };
      return obj;
    }, {} as Record<string, { wins: number; losses: number }>);
    const detailedChampStats = getDetailedChampStats(participant, teamStats);
    const currentTotalStats = getMatchTotalStats(
      participant,
      teamStats.totalKills - teamStats.totalDeaths
    );
    const currentHighs = getMatchHighs(
      currentTotalStats,
      detailedChampStats,
      participant,
      match,
      matchData.info.gameStartTimestamp
    );
    let championClass =
      ChampionClasses[champion as keyof typeof ChampionClasses];
    if (!Array.isArray(championClass)) {
      championClass = [championClass];
    }
    for (const champClass of championClass) {
      if (!(champClass in playerStats.classWinRates)) {
        playerStats.classWinRates[champClass as keyof ClassWinRates] = {
          wins: 0,
          losses: 0,
        };
      }
      if (win) {
        playerStats.classWinRates[champClass as keyof ClassWinRates].wins += 1;
      } else {
        playerStats.classWinRates[
          champClass as keyof ClassWinRates
        ].losses += 1;
      }
    }

    if (champStats[champion]) {
      champStats[champion].wins += win ? 1 : 0;
      champStats[champion].losses += win ? 0 : 1;
      champStats[champion].winRate =
        (champStats[champion].wins /
          (champStats[champion].wins + champStats[champion].losses)) *
        100;
      const prevPlayed = champStats[champion].totalPlayed;
      delete detailedChampStats["kda"];
      champStats[champion].totalPlayed = prevPlayed + 1;
      mergeAverages(champStats[champion].stats, detailedChampStats, prevPlayed);
      mergeTotals(champStats[champion].totalStats, currentTotalStats);
      mergeChampHighs(champStats[champion].highs, currentHighs);
      champStats[champion].stats.kda =
        (champStats[champion].stats.killsPerGame +
          champStats[champion].stats.assistsPerGame) /
        champStats[champion].stats.deathsPerGame;
    } else {
      champStats[champion] = {
        wins: win ? 1 : 0,
        losses: win ? 0 : 1,
        winRate: win ? 100 : 0,
        totalPlayed: 1,
        totalStats: currentTotalStats,
        stats: detailedChampStats,
        highs: currentHighs,
      };
    }
    playerStats.wins += win ? 1 : 0;
    playerStats.losses += win ? 0 : 1;
    playerStats.winRate =
      (playerStats.wins / (playerStats.wins + playerStats.losses)) * 100;
    currentResults.push(win ? 1 : 0);
    mergeTotals(playerStats.teammates, teammatesWinObject);
    mergeAverages(
      playerStats.stats,
      detailedChampStats,
      playerStats.totalPlayed
    );
    playerStats.totalPlayed += 1;
    mergeTotals(playerStats.totalStats, currentTotalStats);
    mergeChampHighs(playerStats.highs, currentHighs);
    playerStats.stats.kda =
      (playerStats.stats.killsPerGame + playerStats.stats.assistsPerGame) /
      playerStats.stats.deathsPerGame;
    player.analyzedMatches.push(match);
    player.playerStats.lastUpdatedTime = Date.now();
  }
  player.playerStats.results = currentResults.concat(
    player.playerStats.results
  );
  const winStreaksObj = analyzeWinStreaks(player.playerStats.results);
  player.playerStats.highs.longestWinStreak = winStreaksObj.longestWinStreak;
  player.playerStats.highs.longestLossStreak = winStreaksObj.longestLossStreak;
  player.playerStats.lastTen = winStreaksObj.lastTenRecord;
  player.playerStats.currentStreak = winStreaksObj.currentStreak.length;
  player.champStats = champStats;
  player.playerStats = playerStats;
  await savePlayerData(player);
  status = "Ready!";
  return true;
};

export const getPlayerChampionStats = async (
  userData: UserData
): Promise<ChampStats | null> => {
  const player = await findByUsername(userData);
  if (!player) return null;
  return player.champStats;
};

export type CHAMP_STATS_ERROR = "PLAYER_NOT_FOUND" | "CHAMP_NOT_FOUND";
export const getPlayerSingleChampionStats = async (
  userData: UserData,
  champName: string
): Promise<SingleChampStats | CHAMP_STATS_ERROR> => {
  const player = await findByUsername(userData);
  if (!player) return "PLAYER_NOT_FOUND";
  if (!(champName in player.champStats)) return "CHAMP_NOT_FOUND";
  return player.champStats[champName];
};

export const getPlayerProfileIcon = async (
  userData: UserData
): Promise<number> => {
  const player = await findByUsername(userData);
  if (!player) return 0;
  return player.profileIcon;
};

export const resetChampionStats = async (
  userData: UserData
): Promise<number | null> => {
  const player = await findByUsername(userData);
  if (!player) return null;
  await queryDB(
    `DELETE FROM Champion_Averages WHERE champ_name != 'player' AND puuid = '${player.puuid}'`
  );
  await queryDB(
    `DELETE FROM Champion_Totals WHERE champ_name != 'player' AND puuid = '${player.puuid}'`
  );
  await queryDB(
    `DELETE FROM Champion_Highs WHERE champ_name != 'player' AND puuid = '${player.puuid}'`
  );
  await queryDB(`DELETE FROM Teammates WHERE puuid = '${player.puuid}'`);
  await queryDB(
    `DELETE FROM Player_Analyzed_Matches WHERE puuid = '${player.puuid}`
  );
  player.champStats = {};
  player.analyzedMatches = [];
  player.playerStats = getBlankPlayerStats();
  await savePlayerData(player);
  return 1;
};

export const clearPlayerMatches = async (
  userData: UserData
): Promise<boolean> => {
  const player = await findByUsername(userData);
  if (!player) return false;
  await queryDB(`DELETE FROM Player_Matches WHERE puuid = '${player.puuid}`);
  player.matches = [];
  await resetChampionStats(userData);
  return true;
};

export const getPlayerStats = async (
  userData: UserData
): Promise<PlayerStats | null> => {
  const player = await findByUsername(userData);
  if (!player) return null;
  return player.playerStats;
};

export const resetAllStats = async (): Promise<number> => {
  await queryDB(`DELETE FROM Champion_Averages`);
  await queryDB(`DELETE FROM Champion_Totals`);
  await queryDB(`DELETE FROM Champion_Highs`);
  await queryDB(`DELETE FROM Teammates`);
  await queryDB(`DELETE FROM Player_Analyzed_Matches`);
  await queryDB(`DELETE FROM Player_Stats_Basic`);
  await queryDB(`DELETE FROM Class_Win_Rates`);

  const all = await findAll();
  for (const row of all) {
    const userData = await puuidToName(row["puuid"]);
    await createByUsername(userData);
  }
  for (const player of Object.values(players)) {
    log.info(`Resetting ${player.gameName}'s stats...`);
    player.champStats = {};
    player.analyzedMatches = [];
    player.playerStats = getBlankPlayerStats();
  }
  return 1;
};

export const clearAllPlayerMatches = async (): Promise<number> => {
  await queryDB(`DELETE FROM Player_Matches`);
  await resetAllStats();
  for (const player of Object.values(players)) {
    log.info(`Clearing ${player.gameName}'s matches...`);
    player.matches = [];
  }
  return 1;
};

export const attachAllMatches = async () => {
  log.info(`Beginning match attachment...`);
  for (const matchId of matches_set) {
    if (matchId.length < 10) continue;
    const participants = await getMatchParticipants(matchId);
    if (!participants) continue;
    for (const p of participants) {
      if (p.puuid in players && !players[p.puuid].matches.includes(matchId)) {
        try {
          await db.query(
            `INSERT INTO Player_Matches (puuid, match_id) VALUES ($1, $2)`,
            [p.puuid, matchId]
          );
          players[p.puuid].matches.push(matchId);
        } catch (error) {
          log.error(`Error attaching match ${matchId} to ${p.puuid}`);
        }

        // await queryDB(
        //   `INSERT INTO Player_Matches (puuid, match_id) VALUES ($1, $2)`,
        //   [p.puuid, matchId]
        // );
      }
    }
  }
  log.info(`Finished match attachment!`);
};

export const getControllerStatus = () => status;
