import { saveFile, loadFile } from "../fs.service";
import { PlayerLineup, Lineups } from "./lineup.interface";
import { UserData, TeamStats } from "../players/player.interface";
import { getUserData } from "../players/player.controller";

const lineupsFilePath = "lineups.json";
let lineups: Lineups = loadFile(lineupsFilePath);

const NUM_LINEUPS_SENT = 50;

export const resetLineupsData = (): void => {
  lineups = {};
  saveFile(lineupsFilePath, lineups);
};

export const analyzeMatchLineup = (
  teammatesInput: string[],
  won: boolean,
  matchId: string,
  userPuuid: string,
  teamStats: TeamStats,
  gameTime: number
): void => {
  const teammates = teammatesInput.slice();
  teammates.push(userPuuid);
  const lineupKey = teammates
    .map((tm) => tm.slice(0, 6))
    .sort()
    .reduce((acc, teammateName) => acc + teammateName, "");

  if (!(lineupKey in lineups)) {
    lineups[lineupKey] = {
      wins: won ? 1 : 0,
      losses: won ? 0 : 1,
      analyzedMatches: [matchId],
      players: teammates,
      kills: teamStats.totalKills,
      deaths: teamStats.totalDeaths,
      averageGameTime: gameTime,
      averageLossTime: won ? 0 : gameTime,
      averageWinTime: won ? gameTime : 0,
      averageDamage: teamStats.totalDamage,
      averageDamageTaken: teamStats.totalDamageTaken,
    };
  } else {
    if (lineups[lineupKey].analyzedMatches.includes(matchId)) {
      return;
    }
    lineups[lineupKey].wins += won ? 1 : 0;
    lineups[lineupKey].losses += won ? 0 : 1;
    const totalPlayed = lineups[lineupKey].wins + lineups[lineupKey].losses;
    lineups[lineupKey].analyzedMatches.push(matchId);
    lineups[lineupKey].kills += teamStats.totalKills;
    lineups[lineupKey].deaths += teamStats.totalDeaths;
    lineups[lineupKey].averageGameTime =
      (lineups[lineupKey].averageGameTime * (totalPlayed - 1) + gameTime) /
      totalPlayed;
    if (won) {
      lineups[lineupKey].averageWinTime =
        (lineups[lineupKey].averageWinTime * (lineups[lineupKey].wins - 1) +
          gameTime) /
        lineups[lineupKey].wins;
    } else {
      lineups[lineupKey].averageLossTime =
        (lineups[lineupKey].averageLossTime * (lineups[lineupKey].losses - 1) +
          gameTime) /
        lineups[lineupKey].losses;
    }
    lineups[lineupKey].averageDamage = Math.round(
      (lineups[lineupKey].averageDamage * (totalPlayed - 1) +
        teamStats.totalDamage) /
        totalPlayed
    );
    lineups[lineupKey].averageDamageTaken = Math.round(
      (lineups[lineupKey].averageDamageTaken * (totalPlayed - 1) +
        teamStats.totalDamageTaken) /
        totalPlayed
    );
  }
  saveFile(lineupsFilePath, lineups);
};

export const getLineupsArray = (): PlayerLineup[] => Object.values(lineups);

export const getTopLineups = (): PlayerLineup[] => {
  const lineupsArray = getLineupsArray();
  lineupsArray.sort((a, b) => {
    if (b.wins + b.losses !== a.wins + a.losses) {
      return b.wins + b.losses - (a.wins + a.losses);
    }
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return a.losses - b.losses;
  });
  return lineupsArray.slice(0, NUM_LINEUPS_SENT);
};

export const getLineupData = async (
  users: UserData[]
): Promise<PlayerLineup | null> => {
  const puuids = [];
  for (const user of users) {
    try {
      const userdata = await getUserData(user.gameName, user.tagLine);
      puuids.push(userdata.puuid);
    } catch (error) {
      return null;
    }
  }
  const lineupKey = puuids
    .map((tm) => tm.slice(0, 6))
    .sort()
    .reduce((acc, teammateName) => acc + teammateName, "");
  if (!(lineupKey in lineups)) {
    return {
      wins: 0,
      losses: 0,
      analyzedMatches: [],
      players: puuids,
      kills: 0,
      deaths: 0,
      averageGameTime: 0,
      averageLossTime: 0,
      averageWinTime: 0,
      averageDamage: 0,
      averageDamageTaken: 0,
    };
  }
  return lineups[lineupKey];
};
