import { SingleChampStats } from "../../api/players/player.interface";

export type champRow = {
  champName: string;
} & SingleChampStats;
