import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  generatePlayerGraphic,
  generateChampionGraphic,
} from "../graphics.service";
import { champNameLowercaseToOfficial } from "../../static/championNameFormatting";

export const graphicsRouter = express.Router();

graphicsRouter.get(
  "/player-stats/:gameName/:tagLine",
  async (req: Request, res: Response) => {
    try {
      const userData = {
        gameName: req.params.gameName,
        tagLine: req.params.tagLine,
      };
      const graphic = await generatePlayerGraphic(userData);
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

graphicsRouter.get(
  "/champ-stats/:gameName/:tagLine/:champName",
  async (req: Request, res: Response) => {
    try {
      const userData = {
        gameName: req.params.gameName,
        tagLine: req.params.tagLine,
      };
      const lowercaseChampName = req.params.champName
        .toLowerCase()
        .replace(/[.'\s]/g, "");
      const officialChampName =
        champNameLowercaseToOfficial[
          lowercaseChampName as keyof typeof champNameLowercaseToOfficial
        ];
      const graphic = await generateChampionGraphic(
        userData,
        officialChampName
      );
      if (graphic === "PLAYER_NOT_FOUND") {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ msg: "Player not found." });
      }
      if (graphic === "CHAMP_NOT_FOUND") {
        return res.status(StatusCodes.NOT_FOUND).json({
          msg: "Champion not found. Perhaps the player has not recorded any games on the champion.",
        });
      }
      return res.status(StatusCodes.OK).send(graphic);
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  }
);
