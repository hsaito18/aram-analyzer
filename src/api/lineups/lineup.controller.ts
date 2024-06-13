import { saveFile, loadFile } from "../fs.service";
import { PlayerLineup, Lineups } from "./lineup.interface";
import { UserData } from "../players/player.interface";

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
