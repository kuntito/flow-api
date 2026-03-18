import express from "express";
import { getNextSongReqHandler } from "./requestHandlers/getNextSong/getNextSongReqHandler";
import multer from "multer";
import { uploadSongReqHandler } from "./requestHandlers/uploadSong/uploadSongReqHandler";
import { deleteSongReqHandler } from "./requestHandlers/deleteSong/deleteSongReqHandler";
import { searchSongsReqHandler } from "./requestHandlers/searchSongs/searchSongsReqHandler";

const flowRouter = express.Router();

flowRouter.get("/next-song", getNextSongReqHandler);

const fileUploadMiddleware = multer({ dest: 'temp-uploads/'});
flowRouter.post(
    "/song",
    fileUploadMiddleware.single("audio"),
    uploadSongReqHandler
);

flowRouter.delete('/:songId', deleteSongReqHandler);

flowRouter.get('/search', searchSongsReqHandler);

export default flowRouter;