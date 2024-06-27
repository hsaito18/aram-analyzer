import express, { Request, Response } from "express";
import { getMatchTimeline, uploadLocalMatches } from "./match.controller";
import { StatusCodes } from "http-status-codes";

export const matchRouter = express.Router();

matchRouter.get("/timeline/:id", async (req: Request, res: Response) => {
  try {
    const timeline = await getMatchTimeline(req.params.id);
    if (!timeline) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: `No match found.` });
    }
    return res.status(StatusCodes.OK).json({ timeline });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});

matchRouter.post("/upload-local", async (req: Request, res: Response) => {
  try {
    await uploadLocalMatches();
    return res.status(StatusCodes.OK).json({ msg: `Local matches uploaded.` });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
});
