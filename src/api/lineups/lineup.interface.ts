export interface PlayerLineup {
  wins: number;
  losses: number;
  analyzedMatches: string[];
  players: string[];
}

export interface Lineups {
  [key: string]: PlayerLineup;
}
