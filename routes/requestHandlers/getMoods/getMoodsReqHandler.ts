import { Request, RequestHandler, Response } from "express";
import { Mood } from "../../../models/Mood";
import { getAllMoods } from "./getMoodsHelpers";

type GetMoodsResponse = {
    success: true;
    moodCount: number;
    moods: Mood[];
} | {
    success: false;
    debug: object;
}


const getMoodsReqHandler: RequestHandler = async (
    req: Request,
    res: Response<GetMoodsResponse>
) => {
    const maybeMoods = await getAllMoods();

    if (maybeMoods) {
        return res
            .status(200)
            .json({
                success: true,
                moodCount: maybeMoods.length,
                moods: maybeMoods,
            });
    } else {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    message: "couldn't get omods from db"
                }
            });
    }
}

export { getMoodsReqHandler };