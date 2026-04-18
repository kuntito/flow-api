import express from "express";
import { getNextSongReqHandler } from "./requestHandlers/getNextSong/getNextSongReqHandler";
import multer from "multer";
import { uploadSongReqHandler } from "./requestHandlers/uploadSong/uploadSongReqHandler";
import { deleteSongReqHandler } from "./requestHandlers/deleteSong/deleteSongReqHandler";
import { searchSongsReqHandler } from "./requestHandlers/searchSongs/searchSongsReqHandler";
import { getSongReqHandler } from "./requestHandlers/getSong/getSongReqHandler";
import { addSongTagReqHandler } from "./requestHandlers/addSongTag/addSongTagReqHandler";

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

// the API host spins down every 15 minutes if it doesn't receive a request
// i've defined this route that does nothing so a robot can keep the API live
// by hitting this route before the host spins down.
flowRouter.get('/dummy', (req, res) => res.send('ok'));

flowRouter.post('/song-tag', addSongTagReqHandler);

export default flowRouter;