import { UserData } from "./api/services/players/player.interface";
import { contextBridge, ipcRenderer } from "electron/renderer";

export const playerAPI = {
  registerPlayer: (userData: UserData) =>
    ipcRenderer.invoke("register-player", userData),
  analyzeMatches: (userData: UserData) =>
    ipcRenderer.send("analyze-matches", userData),
  getChampStats: (userData: UserData) =>
    ipcRenderer.invoke("get-champ-stats", userData),
  onTableChampStats: (channel: string, func: any) => {
    const newFunc = (_: any, data: any) => func(data);
    ipcRenderer.on(channel, newFunc);
    return () => ipcRenderer.removeListener(channel, newFunc);
  },
};

contextBridge.exposeInMainWorld("playerAPI", playerAPI);
