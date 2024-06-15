export interface PlayerLineup {
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  averageWinTime: number;
  averageLossTime: number;
  averageGameTime: number;
  averageDamage: number;
  averageDamageTaken: number;
  analyzedMatches: string[];
  players: string[];
}

export interface Lineups {
  [key: string]: PlayerLineup;
}
