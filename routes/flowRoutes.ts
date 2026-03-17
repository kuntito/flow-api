import express from "express";
import { getNextSong as getNextSongReqHandler } from "./requestHandlers/getNextSong/getNextSongReqHandler";
import multer from "multer";
import { uploadSong as uploadSongReqHandler } from "./requestHandlers/uploadSong/uploadSongReqHandler";
import { deleteSong as deleteSongReqHandler } from "./requestHandlers/deleteSong/deleteSong";

const flowRouter = express.Router();

flowRouter.get("/next-song", getNextSongReqHandler);

const fileUploadMiddleware = multer({ dest: 'temp-uploads/'});
flowRouter.post(
    "/song",
    fileUploadMiddleware.single("audio"),
    uploadSongReqHandler
);

flowRouter.delete('/:songId', deleteSongReqHandler);

export default flowRouter;