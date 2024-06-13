import fs from "fs";
import log from "electron-log/main";

export const loadFile = (filePath: string): any => {
  log.info("Loading players");
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    log.info(`Error loading players: ${error}`);
    return {};
  }
};

export const saveFile = (filePath: string, data: any): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data), "utf-8");
    log.info(`${filePath} saved successfully!`);
  } catch (error) {
    log.info(`Error : ${error}`);
  }
};
