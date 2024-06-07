import { ChampHighs } from "./players/player.interface";

export const mergeAverages = (obj1: any, obj2: any, prevCount: number) => {
  for (const [key, val] of Object.entries(obj2)) {
    if (typeof val === "number") {
      obj1[key] = (obj1[key] * prevCount + val) / (prevCount + 1);
    } else if (typeof val === "object") {
      mergeAverages(obj1[key], val, prevCount);
    }
  }
};

export const mergeTotals = (obj1: any, obj2: any) => {
  for (const [key, val] of Object.entries(obj2)) {
    if (!(key in obj1)) {
      obj1[key] = val;
      continue;
    }
    if (typeof val === "number") {
      obj1[key] = obj1[key] + val;
    } else if (typeof val === "object") {
      mergeTotals(obj1[key], val);
    }
  }
};

export const mergeMax = (obj1: any, obj2: any) => {
  for (const [key, val] of Object.entries(obj2)) {
    if (typeof val === "number") {
      obj1[key] = Math.max(obj1[key], val);
    } else if (typeof val === "object") {
      mergeMax(obj1[key], val);
    }
  }
};

export const mergeChampHighs = (obj1: ChampHighs, obj2: ChampHighs) => {
  for (const [key, val] of Object.entries(obj2)) {
    if (val.value > obj1[key as keyof ChampHighs].value) {
      obj1[key as keyof ChampHighs] = {
        value: val.value,
        matchId: val.matchId,
        date: val.date,
      };
    }
  }
};
