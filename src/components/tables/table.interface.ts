import { SingleChampStats } from "../../api/services/players/player.interface";

export type champRow = {
  champName: string;
  lastUpdatedTime: number;
} & SingleChampStats;