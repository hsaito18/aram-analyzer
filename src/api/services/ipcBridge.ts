import { ipcMain } from "electron";
import {
  createByUsername,
  saveARAMMatches,
  analyzePlayerMatches,
  getPlayerChampionStats,
} from "./players/player.controller";

ipcMain.handle("register-player", (event, userData) => {
  return createByUsername(userData);
});

ipcMain.on("analyze-matches", async (event, userData) => {
  console.log("analyzing matches for user", userData);
  await saveARAMMatches(userData);
  await analyzePlayerMatches(userData);
});

function champDataArrayizer(obj: any) {
  return Object.keys(obj).map((key) => ({
    champName: key,
    ...obj[key],
  }));
}

ipcMain.handle("get-champ-stats", async (event, userData) => {
  const data = await getPlayerChampionStats(userData);
  const arrData = champDataArrayizer(data);
  event.sender.send("champTableData", arrData);
  return arrData;
});
