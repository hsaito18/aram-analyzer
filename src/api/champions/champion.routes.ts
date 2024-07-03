import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { champNameLowercaseToOfficial } from "../../static/championNameFormatting";
import { getChampStats } from "./champion.controller";

export const championsRouter = express.Router();

championsRouter.get("/:champion", async (req: Request, res: Response) => {
  try {
    const lowercaseChampName = req.params.champion
      .toLowerCase()
      .replace(/[.'\s]/g, "");
    const officialChampName =
      champNameLowercaseToOfficial[
        lowercaseChampName as keyof typeof champNameLowercaseToOfficial
      ];
    const champData = await getChampStats(officialChampName);
    if (champData === null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "No champion data found.",
      });
    }
    return res.status(StatusCodes.OK).send(champData);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});
