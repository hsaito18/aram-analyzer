export interface UserData {
  gameName: string;
  tagLine: string;
}

export interface ChampStats {
  [key: string]: SingleChampStats;
}

export interface SingleChampStats {
  wins: number;
  losses: number;
  winRate: number;
  totalPlayed: number;
  stats: DetailedChampStats;
  totalStats: TotalChampStats;
}

export interface DetailedChampStats {
  damagePerMinute: number;
  goldPerMinute: number;
  ccPerMinute: number;
  healingPerMinute: number;
  shieldingPerMinute: number;
  objectiveDamagePerMinute: number;
  damageTakenPerMinute: number;
  selfMitigatedPerMinute: number;
  killsPerMinute: number;
  deathsPerMinute: number;
  assistsPerMinute: number;
  killParticipation: number;
  damageShare: number;
  goldShare: number;
  killShare: number;
  killsPerGame: number;
  deathsPerGame: number;
  assistsPerGame: number;
  kda?: number;
}

export interface TotalChampStats {
  totalDamage: number;
  totalGold: number;
  totalCCTime: number;
  totalHealing: number;
  totalShielding: number;
  totalObjectiveDamage: number;
  totalDamageTaken: number;
  totalSelfMitigated: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
}

export interface TeamStats {
  totalKills: number;
  totalDamage: number;
  totalGold: number;
}

export interface Player {
  puuid: string;
  gameName: string;
  tagLine: string;
  matches: string[];
  analyzedMatches: string[];
  champStats: ChampStats;
  playerStats: PlayerStats;
  profileIcon: number;
}

export interface Players {
  [key: string]: Player;
}

export interface PlayerStats {
  wins: number;
  losses: number;
  winRate: number;
  totalPlayed: number;
  stats: DetailedChampStats;
  totalStats: TotalChampStats;
}

export interface SimplePlayerStats {
  wins: number;
  losses: number;
  winRate: number;
  totalPlayed: number;
}
