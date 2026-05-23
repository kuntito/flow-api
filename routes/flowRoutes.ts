import express from "express";
import { getNextSongReqHandler } from "./requestHandlers/getNextSong/getNextSongReqHandler";
import multer from "multer";
import { uploadSongReqHandler } from "./requestHandlers/uploadSong/uploadSongReqHandler";
import { deleteSongReqHandler } from "./requestHandlers/deleteSong/deleteSongReqHandler";
import { searchSongsReqHandler } from "./requestHandlers/searchSongs/searchSongsReqHandler";
import { getSongReqHandler } from "./requestHandlers/getSong/getSongReqHandler";
import { addSongTagReqHandler } from "./requestHandlers/addSongTag/addSongTagReqHandler";
import { addTagToSongReqHandler } from "./requestHandlers/addTagToSong/addTagToSongReqHandler";
import { fetchSongTagTypesReqHandler } from "./requestHandlers/fetchSongTagTypes/fetchSongTagTypesReqHandler";
import { searchSongWithTagReqHandler } from "./requestHandlers/searchSongs/searchSongWithTags/searchSongWithTagsReqHandler";
import { addNotTagToSongReqHandler } from "./requestHandlers/tagsToSong/addNotTagToSong/addNotTagToSongReqHandler";
import { getSongsForTaggingRH } from "./requestHandlers/getSongsForTagging/getSongsForTaggingRH";

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
flowRouter.get('/search-w-tags', searchSongWithTagReqHandler);

flowRouter.get('/song/:songIdStr', getSongReqHandler);

// the API host spins down every 15 minutes if it doesn't receive a request
// i've defined this route that does nothing so a robot can keep the API live
// by hitting this route before the host spins down.
flowRouter.get('/dummy', (req, res) => res.send('ok'));

flowRouter.post('/song-tag', addSongTagReqHandler);

flowRouter.post('/song/:songIdStr/tag', addTagToSongReqHandler);
flowRouter.post('/song/:songIdStr/notTag', addNotTagToSongReqHandler);

flowRouter.get('/song-tag-types', fetchSongTagTypesReqHandler);

flowRouter.get('/songsForTagging/:tagIdStr', getSongsForTaggingRH);

export default flowRouter;