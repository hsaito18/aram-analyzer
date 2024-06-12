import {
  UserData,
  Player,
  Players,
  ChampStats,
  SingleChampStats,
  DetailedChampStats,
  TotalChampStats,
  ChampHighs,
  TeamStats,
  PlayerStats,
  getBlankPlayerStats,
  ClassWinRates,
} from "./player.interface";
import { Match, Participant } from "../matches/match.interface";
import {
  hasMatch,
  downloadMatch,
  getMatchData,
  matches_set,
} from "../matches/match.controller";
import { mergeAverages, mergeTotals, mergeChampHighs } from "../object.service";
import { ChampionClasses } from "../../static/championClasses";
import { RIOT_API_KEY } from "../../config/API_KEY/apiConfig";
import fs from "fs";
import axios from "axios";
import log from "electron-log/main";

const playersFilePath = "players.json";
let players: Players = loadFile(playersFilePath);

const puuidMapFilePath = "puuid-map.json";
let puuidMap = loadFile(puuidMapFilePath);

let status = "Ready!";

function loadFile(filePath: string): any {
  log.info("Loading players");
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    log.info(`Error loading players: ${error}`);
    return {};
  }
}

function saveFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data), "utf-8");
    log.info(`${filePath} saved successfully!`);
  } catch (error) {
    log.info(`Error : ${error}`);
  }
}

function savePlayers() {
  saveFile(playersFilePath, players);
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

async function getNameFromPuuid(puuid: string): Promise<UserData> {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
      },
    };
    axios
      .get(
        `https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
        options
      )
      .then((res) => {
        resolve(res.data);
      })
      .catch(async (error) => {
        if (error.response.status === 429) {
          log.info(`Rate limited, waiting 2 minutes...`);
          await new Promise((resolve) => setTimeout(resolve, 120000));
          resolve(getNameFromPuuid(puuid));
        } else {
          reject(error);
        }
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

export const puuidToName = async (puuid: string): Promise<UserData> => {
  if (puuid in puuidMap) return puuidMap[puuid];
  const res = await registerPuuid(puuid);
  if (!res) return { gameName: "unknown", tagLine: "" };
  return puuidMap[puuid];
};

export type CREATE_BY_USERNAME_RESPONSE =
  | Player
  | "ALREADY_EXISTS"
  | "NOT_FOUND"
  | "BUSY";

export const createByUsername = async (
  userData: UserData
): Promise<CREATE_BY_USERNAME_RESPONSE> => {
  try {
    const actualUserData = await getUserData(
      userData.gameName,
      userData.tagLine
    );
    if (actualUserData.puuid in players) return "ALREADY_EXISTS";
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
    if (!(actualUserData.puuid in puuidMap)) {
      puuidMap[actualUserData.puuid] = {
        gameName: actualUserData.gameName,
        tagLine: actualUserData.tagLine,
      };
      saveFile(puuidMapFilePath, puuidMap);
    }
    return user;
  } catch (error) {
    console.error(`Failed to get PUUID: ${error}`);
    if (error.response.status === 429) {
      return "BUSY";
    }
    return "NOT_FOUND";
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
): Promise<string[] | string> => {
  const player = await findByUsername(userData);
  if (!player) return "NOT_FOUND";
  const puuid = player.puuid;
  status = `Getting ARAMs for ${player.gameName}#${player.tagLine}`;
  const matches = await getAllARAMs(puuid);
  player.matches = [...new Set([...player.matches, ...matches])];
  savePlayers();
  status = "Ready!";
  return player.matches;
};

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
  };
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
    }
  }
}

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

const puuidMapRegisterTeammates = async (teammates: string[]) => {
  for (const teammate of teammates) {
    if (teammate in puuidMap) continue;
    try {
      const res = await registerPuuid(teammate);
      if (!res) {
        log.info(`Rate limited, waiting 2 minutes...`);
        await new Promise((resolve) => setTimeout(resolve, 120000));
        await registerPuuid(teammate);
      }
    } catch (error) {
      log.error(`Error registering game name for ${teammate} - ${error}`);
    }
  }
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
    puuidMap[puuid] = userData;
    console.log(`Registered ${userData.gameName}#${userData.tagLine}`);
  }
  return true;
}

export const analyzePlayerMatches = async (
  userData: UserData
): Promise<boolean> => {
  const player = await findByUsername(userData);
  if (!player) return false;
  await updateProfileIcon(player);
  const champStats: ChampStats = player.champStats;
  const playerStats: PlayerStats = player.playerStats;
  status = `Downloading matches for ${player.gameName}#${player.tagLine}...`;
  await downloadMatches(player.matches);
  status = `Analyzing matches for ${player.gameName}#${player.tagLine}...`;
  const currentResults = []; // This should work as long as all the games that have not been analyzed are all newer than all the analyzed games
  for (const match of player.matches) {
    if (player.analyzedMatches.includes(match)) continue;
    const matchData = await getMatchData(match);
    if (!matchData) continue;
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
    // await puuidMapRegisterTeammates(teammates);
    const teammatesWinObject = teammates.reduce((obj, teammate) => {
      obj[teammate] = {
        wins: win ? 1 : 0,
        losses: win ? 0 : 1,
      };
      return obj;
    }, {} as Record<string, { wins: number; losses: number }>);
    const detailedChampStats = getDetailedChampStats(participant, teamStats);
    const currentTotalStats = getMatchTotalStats(participant);
    const currentHighs = getMatchHighs(
      currentTotalStats,
      detailedChampStats,
      participant,
      match,
      String(matchData.info.gameStartTimestamp)
    );
    let championClass =
      ChampionClasses[champion as keyof typeof ChampionClasses];
    if (!Array.isArray(championClass)) {
      championClass = [championClass];
    }
    for (const champClass of championClass) {
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
  savePlayers();
  saveFile(puuidMapFilePath, puuidMap);
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

export const attachAllMatches = async () => {
  log.info(`Beginning match attachment...`);
  for (const matchId of matches_set) {
    if (matchId.length < 10) continue;
    const matchData = await getMatchData(matchId);
    if (!matchData) continue;
    for (const participant of matchData.info.participants) {
      if (
        participant.puuid in players &&
        !(matchId in players[participant.puuid].matches)
      ) {
        players[participant.puuid].matches.push(matchId);
      }
    }
  }
  log.info(`Finished match attachment!`);
  savePlayers();
};

export const getControllerStatus = () => status;
