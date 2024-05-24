// import express, { Request, Response } from "express";
// import { Player, UserData, ChampStats } from "./player.interface";
// import { StatusCodes } from "http-status-codes";
// import * as database from "./player.controller";

// export const playerRouter = express.Router();

// playerRouter.get("/users", async (req: Request, res: Response) => {
//   try {
//     const allUsers: Player[] = await database.findAll();

//     if (!allUsers) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ msg: `No players at this time.` });
//     }
//     return res
//       .status(StatusCodes.OK)
//       .json({ total_user: allUsers.length, allUsers });
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
//   }
// });

// playerRouter.get("/puuid/:id", async (req: Request, res: Response) => {
//   try {
//     const user: Player = await database.findOne(req.params.id);

//     if (!user) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ error: `User not found!` });
//     }

//     return res.status(StatusCodes.OK).json({ user });
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
//   }
// });

// playerRouter.get(
//   "/username/:gameName/:tagLine",
//   async (req: Request, res: Response) => {
//     try {
//       const user: Player | null = await database.findByUsername({
//         gameName: req.params.gameName,
//         tagLine: req.params.tagLine,
//       });

//       if (!user) {
//         return res
//           .status(StatusCodes.NOT_FOUND)
//           .json({ error: `User not found!` });
//       }

//       return res.status(StatusCodes.OK).json({ user });
//     } catch (error) {
//       return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
//     }
//   }
// );

// playerRouter.post("/register", async (req: Request, res: Response) => {
//   try {
//     const userData: UserData = req.body;

//     const user: Player | null = await database.createByUsername(userData);

//     if (!user) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ error: `User already exists!` });
//     }

//     return res.status(StatusCodes.CREATED).json({ user });
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
//   }
// });

// playerRouter.delete("/:id", async (req: Request, res: Response) => {
//   try {
//     const id = req.params.id;

//     const user = await database.findOne(id);

//     if (!user) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ error: `User does not exist` });
//     }

//     await database.remove(id);

//     return res.status(StatusCodes.OK).json({ msg: "User deleted" });
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
//   }
// });

// playerRouter.post("/save-matches", async (req: Request, res: Response) => {
//   try {
//     const userData: UserData = req.body;

//     const matches: string[] | null = await database.saveARAMMatches(userData);

//     if (!matches) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ error: `User does not exist` });
//     }

//     return res.status(StatusCodes.CREATED).json({ matches });
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
//   }
// });

// playerRouter.post("/analyze-matches", async (req: Request, res: Response) => {
//   try {
//     const userData: UserData = req.body;
//     const success = await database.analyzePlayerMatches(userData);
//     const champStats: ChampStats | null = await database.getPlayerChampionStats(
//       userData
//     );
//     const playerStats = await database.getPlayerStats(userData);
//     if (!success || !champStats || !playerStats) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ error: `User does not exist` });
//     }
//     return res
//       .status(StatusCodes.CREATED)
//       .json({ champions: champStats, player: playerStats });
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
//   }
// });

// playerRouter.post("/reset-stats", async (req: Request, res: Response) => {
//   try {
//     const userData: UserData = req.body;
//     const success: number | null = await database.resetChampionStats(userData);
//     if (!success) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ error: `User does not exist` });
//     }

//     return res.status(StatusCodes.OK).json({ success });
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
//   }
// });

// playerRouter.post("/reset-all-stats", async (req: Request, res: Response) => {
//   try {
//     const success: number | null = await database.resetAllChampionStats();
//     if (!success) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ error: `Error resetting all.` });
//     }
//     return res.status(StatusCodes.OK).json({ success });
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
//   }
// });
