import { saveFile, loadFile } from "../fs.service";
import { PlayerLineup, Lineups } from "./lineup.interface";
import { UserData } from "../players/player.interface";
import { getUserData } from "../players/player.controller";

const lineupsFilePath = "lineups.json";
let lineups: Lineups = loadFile(lineupsFilePath);

export const analyzeMatchLineup = (
  teammatesInput: string[],
  won: boolean,
  matchId: string,
  userPuuid: string
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
    };
  } else {
    if (lineups[lineupKey].analyzedMatches.includes(matchId)) {
      return;
    }
    lineups[lineupKey].wins += won ? 1 : 0;
    lineups[lineupKey].losses += won ? 0 : 1;
    lineups[lineupKey].analyzedMatches.push(matchId);
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
  return lineupsArray.slice(0, 25);
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
    };
  }
  return lineups[lineupKey];
};
