import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getLineupData } from "./lineup.controller";

export const lineupsRouter = express.Router();

lineupsRouter.get(
  "/lineup/:gn1/:tl1/:gn2/:tl2/:gn3/:tl3/:gn4/:tl4/:gn5/:tl5",
  async (req: Request, res: Response) => {
    try {
      const users = [
        { gameName: req.params.gn1, tagLine: req.params.tl1 },
        { gameName: req.params.gn2, tagLine: req.params.tl2 },
        { gameName: req.params.gn3, tagLine: req.params.tl3 },
        { gameName: req.params.gn4, tagLine: req.params.tl4 },
        { gameName: req.params.gn5, tagLine: req.params.tl5 },
      ];
      const lineupData = await getLineupData(users);
      if (lineupData === null) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: "One or more players not found.",
        });
      }
      return res.status(StatusCodes.OK).send(lineupData);
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  }
);
