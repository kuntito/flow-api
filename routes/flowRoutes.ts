import express from "express";
import { getNextSong } from "./requestHandlers/getNextSong";
import multer from "multer";
import { uploadSong } from "./requestHandlers/uploadSong/uploadSong";

const flowRouter = express.Router();

flowRouter.get("/next-song", getNextSong);

const fileUploadMiddleware = multer({ dest: 'temp-uploads/'});
flowRouter.post(
    "/song",
    fileUploadMiddleware.single("audio"),
    uploadSong
);

export default flowRouter;