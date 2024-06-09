import dotenv from "dotenv";

dotenv.config();

export const IS_SERVER = process.env.IS_SERVER
  ? process.env.IS_SERVER === "true"
  : false;
export const SERVER_PORT = 3000;
