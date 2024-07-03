import { ChampionStats, ChampionPlayerStats } from "./champion.interface";
import * as db from "../db/index";

export const getChampStats = async (
  champName: string
): Promise<ChampionPlayerStats> => {
  const { rows } = await db.query(
    "SELECT puuid, wins, losses, kills, deaths, assists FROM champion_totals WHERE champ_name = $1",
    [champName]
  );
  if (rows.length === 0) return null;
  const players: { [key: string]: ChampionStats } = {};
  let totalWins = 0;
  let totalLosses = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  for (const row of rows) {
    players[row.puuid as keyof typeof players] = {
      wins: row.wins,
      losses: row.losses,
      winRate: row.wins / (row.wins + row.losses),
      totalPlayed: row.wins + row.losses,
      kda: (row.kills + row.assists) / (row.deaths === 0 ? 1 : row.deaths),
    };
    totalWins += row.wins;
    totalLosses += row.losses;
    totalKills += row.kills;
    totalDeaths += row.deaths;
    totalAssists += row.assists;
  }
  return {
    overall: {
      wins: totalWins,
      losses: totalLosses,
      winRate: totalWins / (totalWins + totalLosses),
      totalPlayed: totalWins + totalLosses,
      kda: (totalKills + totalAssists) / (totalDeaths === 0 ? 1 : totalDeaths),
    },
    players,
  };
};
