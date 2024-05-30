import { ipcMain } from "electron";
import {
  createByUsername,
  saveARAMMatches,
  analyzePlayerMatches,
  getPlayerChampionStats,
  getPlayerProfileIcon,
  getPlayerStats,
  findByUsername,
} from "./players/player.controller";
import { UserData } from "./players/player.interface";
import { getSearchHistory, addSearchHistory } from "./searchHistory";
import Logger = require("electron-log/main");

ipcMain.handle("register-player", (event, userData) => {
  return createByUsername(userData);
});

async function getChampStats(event: any, userData: UserData) {
  const data = await getPlayerChampionStats(userData);
  const arrData = champDataArrayizer(data);
  arrData.sort((a, b) => b.wins - a.wins);
  event.sender.send("champTableData", arrData);
  return arrData;
}

async function getPlayerStatsHandle(event: any, userData: UserData) {
  const data = await getPlayerStats(userData);
  event.sender.send("playerStatsData", data);
}

ipcMain.on("analyze-matches", async (event, userData) => {
  Logger.log("analyzing matches for user", userData);
  await saveARAMMatches(userData);
  await analyzePlayerMatches(userData);
  await getChampStats(event, userData);
  await getPlayerStatsHandle(event, userData);
});

function champDataArrayizer(obj: any) {
  return Object.keys(obj).map((key) => ({
    champName: key,
    ...obj[key],
  }));
}

ipcMain.handle("get-champ-stats", getChampStats);

ipcMain.handle("get-profile-icon", async (event, userData) => {
  console.log("getting profile icon for user", userData);
  const icon = await getPlayerProfileIcon(userData);
  return icon;
});

ipcMain.on("get-player-stats", getPlayerStatsHandle);

ipcMain.handle("check-player", async (event, userData) => {
  const player = await findByUsername(userData);
  return !!player;
});

ipcMain.handle("create-player", async (event, userData) => {
  const out = await createByUsername(userData);
  return !!out;
});

ipcMain.handle("player-search", async (event, userData) => {
  addSearchHistory(userData);
  const player = await findByUsername(userData);
  console.log(`searched for player ${userData.gameName}#${userData.tagLine}`);
  return { gameName: player.gameName, tagLine: player.tagLine };
});

ipcMain.handle("get-search-history", async (event) => {
  return getSearchHistory();
});
