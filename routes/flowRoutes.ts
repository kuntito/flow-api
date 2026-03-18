import express from "express";
import { getNextSongReqHandler } from "./requestHandlers/getNextSong/getNextSongReqHandler";
import multer from "multer";
import { uploadSongReqHandler } from "./requestHandlers/uploadSong/uploadSongReqHandler";
import { deleteSongReqHandler } from "./requestHandlers/deleteSong/deleteSongReqHandler";
import { searchSongsReqHandler } from "./requestHandlers/searchSongs/searchSongsReqHandler";
import { getSongReqHandler } from "./requestHandlers/getSong/getSongReqHandler";

const flowRouter = express.Router();

flowRouter.get("/next-song", getNextSongReqHandler);

const fileUploadMiddleware = multer({ dest: 'temp-uploads/'});
flowRouter.post(
    "/song",
    fileUploadMiddleware.single("audio"),
    uploadSongReqHandler
);

flowRouter.delete('/song/:songId', deleteSongReqHandler);

flowRouter.get('/search', searchSongsReqHandler);

flowRouter.get('/song/:songIdStr', getSongReqHandler);

export default flowRouter;