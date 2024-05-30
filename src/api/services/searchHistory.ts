import { app } from "electron";
import path from "path";
import fs from "fs";
import log from "electron-log/main";
import { findByUsername } from "./players/player.controller";

const searchHistoryFilePath = path.join(
  app.getPath("userData"),
  "searchHistory.json"
);

let searchHistory: Search[] = loadSearchHistory();

function loadSearchHistory() {
  log.info("Loading search history!");
  log.info("Loading from path: " + searchHistoryFilePath);
  try {
    const data = fs.readFileSync(searchHistoryFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    log.info(`Error loading search history: ${error}`);
    return [];
  }
}

function saveSearchHistory() {
  log.info("Saving search history!");
  fs.writeFileSync(
    searchHistoryFilePath,
    JSON.stringify(searchHistory),
    "utf-8"
  );
}

export interface Search {
  gameName: string;
  tagLine: string;
  timestamp: number;
}

export const getSearchHistory = (): Search[] => {
  return searchHistory;
};

async function getProperUserData(search: Search) {
  const player = await findByUsername({
    gameName: search.gameName,
    tagLine: search.tagLine,
  });
  if (player) {
    return {
      gameName: player.gameName,
      tagLine: player.tagLine,
      timestamp: Date.now(),
    };
  }
}

function removeOldestDuplicate(history: Search[], search: Search) {
  return history.filter(
    (s) => !(s.gameName === search.gameName && s.tagLine === search.tagLine)
  );
}

function remove5thOldest(history: Search[]) {
  return history.slice(0, 4);
}

export const addSearchHistory = async (search: Search) => {
  const fixedSearch = await getProperUserData(search);
  if (searchHistory.length === 0) {
    searchHistory = [fixedSearch];
    return;
  }
  searchHistory = removeOldestDuplicate(searchHistory, fixedSearch);
  searchHistory = remove5thOldest(searchHistory);
  searchHistory = [fixedSearch, ...searchHistory];
  saveSearchHistory();
};

export const clearSearchHistory = () => {
  searchHistory = [];
  saveSearchHistory();
};
