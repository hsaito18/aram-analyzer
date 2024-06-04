import {
  UserData,
  Player,
  Players,
  ChampStats,
  DetailedChampStats,
  TotalChampStats,
  ChampHighs,
  TeamStats,
  PlayerStats,
  getBlankPlayerStats,
} from "./player.interface";
import { Match, Participant } from "../matches/match.interface";
import { hasMatch, loadMatch, saveMatch } from "../matches/match.controller";
import { mergeAverages, mergeTotals, mergeChampHighs } from "../object.service";
import { RIOT_API_KEY } from "../../../config/apiConfig";
import fs from "fs";
import axios from "axios";
import log from "electron-log/main";

const playersFilePath = "players.json";
let players: Players = loadPlayers();

function loadPlayers(): Players {
  log.info("Loading players");
  try {
    const data = fs.readFileSync(playersFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    log.info(`Error loading players: ${error}`);
    return {};
  }
}

function savePlayers() {
  try {
    fs.writeFileSync(playersFilePath, JSON.stringify(players), "utf-8");
    log.info(`Player saved successfully!`);
  } catch (error) {
    log.info(`Error : ${error}`);
  }
}

async function getUserData(gameName: string, tagLine: string): Promise<any> {
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

export const findAll = async (): Promise<Player[]> => Object.values(players);

export const findOne = async (id: string): Promise<Player> => players[id];

export const createByUsername = async (
  userData: UserData
): Promise<Player | null> => {
  try {
    const actualUserData = await getUserData(
      userData.gameName,
      userData.tagLine
    );
    const user: Player = {
      puuid: actualUserData.puuid,
      gameName: actualUserData.gameName,
      tagLine: actualUserData.tagLine,
      matches: [],
      analyzedMatches: [],
      champStats: {},
      playerStats: getBlankPlayerStats(),
      profileIcon: 0,
    };
    players[actualUserData.puuid] = user;
    savePlayers();
    return user;
  } catch (error) {
    console.error(`Failed to get PUUID: ${error}`);
    return null;
  }
};

export const findByUsername = async (
  userData: UserData
): Promise<Player | null> => {
  const allPlayers = await findAll();
  const searchedPlayer = allPlayers.find(
    (result) =>
      result.gameName.toLowerCase() === userData.gameName.toLowerCase() &&
      result.tagLine.toLowerCase() === userData.tagLine.toLowerCase()
  );
  if (!searchedPlayer) return null;
  return searchedPlayer;
};

export const remove = async (id: string): Promise<null | void> => {
  const player = await findOne(id);
  if (!player) return null;
  delete players[id];
  savePlayers();
};

export const saveARAMMatches = async (
  userData: UserData
): Promise<string[] | null> => {
  const player = await findByUsername(userData);
  if (!player) return null;
  const puuid = player.puuid;
  const matches = await getAllARAMs(puuid);
  player.matches = matches;
  savePlayers();
  return player.matches;
};

async function downloadMatch(id: string): Promise<boolean> {
  const options = {
    method: "GET",
    headers: {
      "X-Riot-Token": RIOT_API_KEY,
    },
  };
  const response = await axios
    .get(
      `https://americas.api.riotgames.com/lol/match/v5/matches/${id}`,
      options
    )
    .catch((error) => {
      if (error.response.status === 429) {
        return 2;
      }
      return 1;
    });
  if (response == 2) return false;
  if (response == 1) throw new Error(`Error downloading match ${id}`);
  const matchData = response?.data;
  if (matchData !== null) {
    saveMatch(id, matchData);
  }
  return true;
}
async function getMatchData(id: string): Promise<Match | null> {
  let matchData: Match | null = null;
  if (!hasMatch(id)) {
    await downloadMatch(id);
  }
  matchData = loadMatch(id);
  return matchData;
}

function getTeamStats(match: Match, teamId: number): TeamStats {
  let totalKills = 0;
  let totalDamage = 0;
  let totalGold = 0;
  for (const participant of match.info.participants) {
    if (participant.teamId === teamId) {
      totalKills += participant.kills;
      totalDamage += participant.totalDamageDealtToChampions;
      totalGold += participant.goldEarned;
    }
  }
  const out: TeamStats = {
    totalKills,
    totalDamage,
    totalGold,
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

function getMatchTotalStats(participant: Participant): TotalChampStats {
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
  };
}

function getMatchHighs(
  matchTotalStats: TotalChampStats,
  detailedChampStats: DetailedChampStats,
  participant: Participant,
  matchId: string,
  date: string
): ChampHighs {
  return {
    mostKills: {
      value: matchTotalStats.totalKills,
      matchId,
      date,
    },
    mostDeaths: {
      value: matchTotalStats.totalDeaths,
      matchId,
      date,
    },
    mostAssists: {
      value: matchTotalStats.totalAssists,
      matchId,
      date,
    },
    mostDamage: {
      value: detailedChampStats.damagePerMinute,
      matchId,
      date,
    },
    mostTotalDamage: {
      value: matchTotalStats.totalDamage,
      matchId,
      date,
    },
    mostGold: {
      value: detailedChampStats.goldPerMinute,
      matchId,
      date,
    },
    mostTotalGold: {
      value: matchTotalStats.totalGold,
      matchId,
      date,
    },
    mostTotalCS: {
      value: participant.totalMinionsKilled,
      matchId,
      date,
    },
    mostCCTime: {
      value: detailedChampStats.ccPerMinute,
      matchId,
      date,
    },
    mostHealing: {
      value: detailedChampStats.healingPerMinute,
      matchId,
      date,
    },
    mostShielding: {
      value: detailedChampStats.shieldingPerMinute,
      matchId,
      date,
    },
    mostDamageShare: {
      value: detailedChampStats.damageShare,
      matchId,
      date,
    },
    mostGoldShare: {
      value: detailedChampStats.goldShare,
      matchId,
      date,
    },
    mostDamageTaken: {
      value: detailedChampStats.damageTakenPerMinute,
      matchId,
      date,
    },
    mostObjectiveDamage: {
      value: detailedChampStats.objectiveDamagePerMinute,
      matchId,
      date,
    },
    mostKillParticipation: {
      value: detailedChampStats.killParticipation,
      matchId,
      date,
    },
    mostSelfMitigated: {
      value: detailedChampStats.selfMitigatedPerMinute,
      matchId,
      date,
    },
    mostTotalCCTime: {
      value: matchTotalStats.totalCCTime,
      matchId,
      date,
    },
    mostTotalHealing: {
      value: matchTotalStats.totalHealing,
      matchId,
      date,
    },
    mostTotalShielding: {
      value: matchTotalStats.totalShielding,
      matchId,
      date,
    },
    mostTotalObjectiveDamage: {
      value: matchTotalStats.totalObjectiveDamage,
      matchId,
      date,
    },
    mostTotalDamageTaken: {
      value: matchTotalStats.totalDamageTaken,
      matchId,
      date,
    },
    mostTotalSelfMitigated: {
      value: matchTotalStats.totalSelfMitigated,
      matchId,
      date,
    },
    biggestCrit: {
      value: participant.largestCriticalStrike,
      matchId,
      date,
    },
    biggestKillingSpree: {
      value: participant.largestKillingSpree,
      matchId,
      date,
    },
    biggestMultikill: {
      value: participant.largestMultiKill,
      matchId,
      date,
    },
  };
}

function updateChampionHighStats(
  participant: Participant,
  champStats: ChampStats
) {
  const champion = participant.championName;
}

async function updateProfileIcon(player: Player): Promise<void> {
  if (player.matches.length == 0) return;
  const latestMatch = player.matches[0];
  const matchData = await getMatchData(latestMatch);
  if (!matchData) {
    player.matches.shift();
    updateProfileIcon(player);
    return;
  }
  const participant = matchData.info.participants.find(
    (participant: any) => participant.puuid === player.puuid
  );
  if (!participant) {
    player.matches.shift();
    updateProfileIcon(player);
    return;
  }
  players[player.puuid].profileIcon = participant.profileIcon;
  savePlayers();
}

async function downloadMatches(matches: string[]): Promise<void> {
  for (const match of matches) {
    if (hasMatch(match)) continue;
    try {
      const res = await downloadMatch(match);
      if (!res) {
        log.info(`Rate limited, waiting 2 minutes...`);
        await new Promise((resolve) => setTimeout(resolve, 120000));
        await downloadMatch(match);
      }
    } catch (error) {
      console.error(`Failed to download match: ${error}`);
      // Handle the error appropriately here
    }
  }
}

export const analyzePlayerMatches = async (
  userData: UserData
): Promise<boolean> => {
  const player = await findByUsername(userData);
  if (!player) return false;
  await updateProfileIcon(player);
  const champStats: ChampStats = player.champStats;
  const playerStats: PlayerStats = player.playerStats;
  await downloadMatches(player.matches);
  for (const match of player.matches) {
    if (player.analyzedMatches.includes(match)) continue;
    const matchData = await getMatchData(match);
    if (!matchData) continue;
    const participant = matchData?.info?.participants?.find(
      (participant: any) => participant.puuid === player.puuid
    );
    if (!participant) continue;
    const win = participant.win;
    const champion = participant.championName;
    const teamId = participant.teamId;
    const teamStats = getTeamStats(matchData, teamId);
    const detailedChampStats = getDetailedChampStats(participant, teamStats);
    const currentTotalStats = getMatchTotalStats(participant);
    const currentHighs = getMatchHighs(
      currentTotalStats,
      detailedChampStats,
      participant,
      match,
      String(matchData.info.gameStartTimestamp)
    );
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
    mergeAverages(
      playerStats.stats,
      detailedChampStats,
      playerStats.totalPlayed
    );
    playerStats.totalPlayed += 1;
    mergeTotals(playerStats.totalStats, currentTotalStats);
    playerStats.stats.kda =
      (playerStats.stats.killsPerGame + playerStats.stats.assistsPerGame) /
      playerStats.stats.deathsPerGame;
    player.analyzedMatches.push(match);
    player.playerStats.lastUpdatedTime = Date.now();
  }
  player.champStats = champStats;
  player.playerStats = playerStats;
  savePlayers();
  return true;
};

export const getPlayerChampionStats = async (
  userData: UserData
): Promise<ChampStats | null> => {
  const player = await findByUsername(userData);
  if (!player) return null;
  return player.champStats;
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
  player.champStats = {};
  player.analyzedMatches = [];
  player.playerStats = getBlankPlayerStats();
  savePlayers();
  return 1;
};

export const getPlayerStats = async (
  userData: UserData
): Promise<PlayerStats | null> => {
  const player = await findByUsername(userData);
  if (!player) return null;
  return player.playerStats;
};

export const resetAllChampionStats = async (): Promise<number> => {
  for (const player of Object.values(players)) {
    log.info(`Resetting ${player.gameName}'s stats...`);
    player.champStats = {};
    player.analyzedMatches = [];
    player.playerStats = getBlankPlayerStats();
  }
  savePlayers();
  return 1;
};
