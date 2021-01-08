import { NextFunction } from "connect";
import { Request, Response } from "express";
import { Constants } from "../constants";
import { BusinessException } from "../exceptions/business-exception";
import { logger } from "../logger";
import { badRequestResponse, failureResponse } from "../response-helper";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack!);
    if (err instanceof BusinessException) {
        const errorData = JSON.parse(err.message);
        res.status(Constants.STATUS_CODE.BAD_REQUEST).send(badRequestResponse(errorData.code, errorData.message));
        return;
    }
    res.status(Constants.STATUS_CODE.INTERNAL_SERVER_ERROR)
                .send(failureResponse(Constants.FAILURE_CODE, Constants.ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
};
