import express from "express";
import { getNextSong } from "./requestHandlers/getNextSong";

const flowRouter = express.Router();

flowRouter.get("/next-song", getNextSong);

export default flowRouter;