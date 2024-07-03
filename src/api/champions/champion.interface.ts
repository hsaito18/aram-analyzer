export interface ChampionStats {
  wins: number;
  losses: number;
  winRate: number;
  totalPlayed: number;
  kda: number;
}

export interface ChampionPlayerStats {
  overall: ChampionStats;
  players: {
    [key: string]: ChampionStats;
  };
}
