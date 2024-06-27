import { PlayerLineup, Lineups } from "./lineup.interface";
import { UserData, TeamStats } from "../players/player.interface";
import { getUserData } from "../players/player.controller";
import * as db from "../db/index";

const NUM_LINEUPS_SENT = 50;

export const resetLineupsData = async () => {
  const resetLineupsQuery = `DELETE FROM Lineups`;
  const resetMatchesQuery = `DELETE FROM Lineup_Analyzed_Matches`;
  const resetMembersQuery = `DELETE FROM Lineup_Members`;
  await db.query(resetLineupsQuery);
  await db.query(resetMatchesQuery);
  await db.query(resetMembersQuery);
};

export const saveLineup = async (data: PlayerLineup) => {
  const lineup_id = generateLineupId(data.players);
  const lineupsQuery = `INSERT INTO Lineups (
                  lineup_id, wins, losses, 
                  kills, deaths, 
                  average_game_time, average_win_time, average_loss_time, 
                  average_damage, average_damage_taken) 
                  VALUES (
                  '${lineup_id}', ${data.wins}, ${data.losses},
                  ${data.kills}, ${data.deaths},
                  ${data.averageGameTime}, ${data.averageWinTime}, ${data.averageLossTime},
                  ${data.averageDamage}, ${data.averageDamageTaken})
                  ON CONFLICT (lineup_id) DO UPDATE SET
                  wins = ${data.wins}, losses = ${data.losses},
                  kills = ${data.kills}, deaths = ${data.deaths},
                  average_game_time = ${data.averageGameTime}, average_win_time = ${data.averageWinTime}, average_loss_time = ${data.averageLossTime},
                  average_damage = ${data.averageDamage}, average_damage_taken = ${data.averageDamageTaken};`;
  const matchesEntries = data.analyzedMatches.map(
    (m_id) => `('${lineup_id}', '${m_id}')`
  );
  const matchesValues = matchesEntries.join(", ");
  const matchesQuery = `INSERT INTO Lineup_Analyzed_Matches (lineup_id, match_id) 
                        VALUES ${matchesValues} 
                        ON CONFLICT ON CONSTRAINT lineup_match_key DO NOTHING
                        `;
  const membersEntries = data.players.map(
    (puuid) => `( '${lineup_id}', '${puuid}')`
  );
  const membersValues = membersEntries.join(", ");
  const membersQuery = `INSERT INTO Lineup_Members (lineup_id, puuid)
                        VALUES ${membersValues}
                        ON CONFLICT ON CONSTRAINT lineup_member_key DO NOTHING`;
  for (const q of [lineupsQuery, matchesQuery, membersQuery]) {
    try {
      await db.query(q);
    } catch (error) {
      console.error("Error saving lineup:", error);
    }
  }
};

export const loadLineup = async (lineup_id: string): Promise<PlayerLineup> => {
  const lineupQuery = `SELECT * FROM Lineups WHERE lineup_id = '${lineup_id}'`;
  const matchesQuery = `SELECT match_id FROM Lineup_Analyzed_Matches WHERE lineup_id = '${lineup_id}'`;
  const membersQuery = `SELECT puuid FROM Lineup_Members WHERE lineup_id = '${lineup_id}'`;
  const lineupData = await db.query(lineupQuery);
  const matchesData = await db.query(matchesQuery);
  const membersData = await db.query(membersQuery);
  if (
    lineupData.rows.length === 0 ||
    matchesData.rows.length === 0 ||
    membersData.rows.length === 0
  )
    return null;
  const lineup = lineupData.rows[0];
  return {
    wins: lineup.wins,
    losses: lineup.losses,
    analyzedMatches: matchesData.rows.map((m) => m.match_id),
    players: membersData.rows.map((m) => m.puuid),
    kills: lineup.kills,
    deaths: lineup.deaths,
    averageGameTime: lineup.average_game_time,
    averageWinTime: lineup.average_win_time,
    averageLossTime: lineup.average_loss_time,
    averageDamage: lineup.average_damage,
    averageDamageTaken: lineup.average_damage_taken,
  };
};

// Is there a chance of collision with 12 base 64 characters?
export const generateLineupId = (players: string[]): string =>
  players
    .map((id) => id.slice(0, 12))
    .sort()
    .join("");

export const analyzeMatchLineup = async (
  teammatesInput: string[],
  won: boolean,
  matchId: string,
  userPuuid: string,
  teamStats: TeamStats,
  gameTime: number
) => {
  const teammates = teammatesInput.slice();
  teammates.push(userPuuid);
  const lineupKey = generateLineupId(teammates);
  const lineupData = await loadLineup(lineupKey);
  if (!lineupData) {
    const freshLineup = {
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
    await saveLineup(freshLineup);
    return;
  }
  if (lineupData.analyzedMatches.includes(matchId)) return;
  lineupData.wins += won ? 1 : 0;
  lineupData.losses += won ? 0 : 1;
  const totalPlayed = lineupData.wins + lineupData.losses;
  lineupData.analyzedMatches.push(matchId);
  lineupData.kills += teamStats.totalKills;
  lineupData.deaths += teamStats.totalDeaths;
  lineupData.averageGameTime =
    (lineupData.averageGameTime * (totalPlayed - 1) + gameTime) / totalPlayed;
  if (won) {
    lineupData.averageWinTime =
      (lineupData.averageWinTime * (lineupData.wins - 1) + gameTime) /
      lineupData.wins;
  } else {
    lineupData.averageLossTime =
      (lineupData.averageLossTime * (lineupData.losses - 1) + gameTime) /
      lineupData.losses;
  }
  lineupData.averageDamage = Math.round(
    (lineupData.averageDamage * (totalPlayed - 1) + teamStats.totalDamage) /
      totalPlayed
  );
  lineupData.averageDamageTaken = Math.round(
    (lineupData.averageDamageTaken * (totalPlayed - 1) +
      teamStats.totalDamageTaken) /
      totalPlayed
  );
  saveLineup(lineupData);
};

export const getTopLineups = async (
  numLineups = NUM_LINEUPS_SENT
): Promise<PlayerLineup[]> => {
  const query = `SELECT lineup_id FROM Lineups ORDER BY wins DESC LIMIT ${numLineups}`;
  const lineupsData = await db.query(query);
  const lineups = [];
  for (const row of lineupsData.rows) {
    const lineup = await loadLineup(row.lineup_id);
    if (lineup) lineups.push(lineup);
  }
  return lineups;
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
  const lineupKey = generateLineupId(puuids);
  const lineupData = await loadLineup(lineupKey);
  if (!lineupData) {
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
  return lineupData;
};
