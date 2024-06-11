import express, { Request, Response } from "express";
import { Player, UserData, ChampStats } from "./player.interface";
import { StatusCodes } from "http-status-codes";
import * as playerController from "./player.controller";

export const playerRouter = express.Router();

playerRouter.get("/users", async (req: Request, res: Response) => {
  try {
    const allUsers: Player[] = await playerController.findAll();

    if (!allUsers) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: `No players at this time.` });
    }
    return res
      .status(StatusCodes.OK)
      .json({ total_user: allUsers.length, allUsers });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

playerRouter.get("/puuid/:id", async (req: Request, res: Response) => {
  try {
    const user: Player = await playerController.findOne(req.params.id);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `User not found!` });
    }

    return res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

playerRouter.get(
  "/username/:gameName/:tagLine",
  async (req: Request, res: Response) => {
    try {
      const user: Player | null = await playerController.findByUsername({
        gameName: req.params.gameName,
        tagLine: req.params.tagLine,
      });

      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: `User not found!` });
      }

      return res.status(StatusCodes.OK).json({ user });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  }
);

playerRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const userData: UserData = req.body;
    const user: playerController.CREATE_BY_USERNAME_RESPONSE =
      await playerController.createByUsername(userData);
    if (user == "ALREADY_EXISTS") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: `User already exists!` });
    }
    if (user == "NOT_FOUND") {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `User not found!` });
    }
    if (user == "BUSY") {
      return res
        .status(StatusCodes.TOO_MANY_REQUESTS)
        .json({ error: `Server is busy!` });
    }
    return res.status(StatusCodes.CREATED).json({ user });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

playerRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const user = await playerController.findOne(id);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `User does not exist` });
    }

    await playerController.remove(id);

    return res.status(StatusCodes.OK).json({ msg: "User deleted" });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

playerRouter.post("/save-matches", async (req: Request, res: Response) => {
  try {
    const userData: UserData = req.body;
    const matches: string[] | string = await playerController.saveARAMMatches(
      userData
    );
    if (typeof matches === "string") {
      if (matches === "NOT_FOUND") {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: `User has not been registered!` });
      }
      return res
        .status(StatusCodes.TOO_MANY_REQUESTS)
        .json({ status: matches });
    }
    return res.status(StatusCodes.OK).json({ matches });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

playerRouter.post("/analyze-matches", async (req: Request, res: Response) => {
  try {
    const userData: UserData = req.body;
    const success = await playerController.analyzePlayerMatches(userData);
    const champStats: ChampStats | null =
      await playerController.getPlayerChampionStats(userData);
    const playerStats = await playerController.getPlayerStats(userData);
    if (!success || !champStats || !playerStats) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `Player not found!` });
    }
    return res
      .status(StatusCodes.OK)
      .json({ champions: champStats, player: playerStats });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

playerRouter.post("/reset-stats", async (req: Request, res: Response) => {
  try {
    const userData: UserData = req.body;
    const success: number | null = await playerController.resetChampionStats(
      userData
    );
    if (!success) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: `User does not exist` });
    }

    return res.status(StatusCodes.OK).json({ success });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

playerRouter.post("/reset-all-stats", async (req: Request, res: Response) => {
  try {
    const success: number | null =
      await playerController.resetAllChampionStats();
    if (!success) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: `Error resetting all.` });
    }
    return res.status(StatusCodes.OK).json({ success });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

playerRouter.get(
  "/player-controller-status",
  async (req: Request, res: Response) => {
    try {
      return res
        .status(StatusCodes.OK)
        .json({ status: playerController.getControllerStatus() });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  }
);
