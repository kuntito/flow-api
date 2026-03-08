import express from "express";
import { getNextSong } from "./requestHandlers/getNextSong/getNextSong";
import multer from "multer";
import { uploadSong } from "./requestHandlers/uploadSong/uploadSong";
import { deleteSong } from "./requestHandlers/deleteSong/deleteSong";

const flowRouter = express.Router();

flowRouter.get("/next-song", getNextSong);

const fileUploadMiddleware = multer({ dest: 'temp-uploads/'});
flowRouter.post(
    "/song",
    fileUploadMiddleware.single("audio"),
    uploadSong
);

flowRouter.delete('/:songId', deleteSong);

export default flowRouter;