import { Constants } from "./constants";

export const successResponse = (data: any = {}, message: string = Constants.SUCCESS_MESSAGE) => {
    return {
        code: Constants.SUCCESS_CODE,
        data,
        message,
        status: true,
    };
};

export const failureResponse = (code: number = 500, message:
    string = Constants.ERROR_MESSAGE.INTERNAL_SERVER_ERROR) => {
    return {
        code,
        message,
        status: false,
    };
};

export const badRequestResponse = (code: number = 400, message: string = Constants.ERROR_MESSAGE.BAD_REQUEST) => {
    return {
        code,
        message,
        status: false,
    };
};
