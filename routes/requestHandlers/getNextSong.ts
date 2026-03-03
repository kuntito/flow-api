import { Request, RequestHandler, Response } from "express";

type GetNextSongResponse = {
    success: true;
    nextSongUrl: string;
} | {
    success: false;
    debug: object;
}

const getNextSong: RequestHandler = async (
    req: Request,
    res: Response<GetNextSongResponse>,
) => {

}

export { getNextSong };