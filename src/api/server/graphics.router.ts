import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { generateGraphic } from "../graphics.service";

export const graphicsRouter = express.Router();

graphicsRouter.get(
  "/player-stats/:gameName/:tagLine",
  async (req: Request, res: Response) => {
    try {
      const userData = {
        gameName: req.params.gameName,
        tagLine: req.params.tagLine,
      };
      const graphic = await generateGraphic(userData);
      if (graphic === "No matches saved!") {
        return res.status(StatusCodes.NO_CONTENT).json({ msg: graphic });
      }
      if (!graphic) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: `Bad request for ${userData.gameName}` });
      }
      return res.status(StatusCodes.OK).send(graphic);
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  }
);
