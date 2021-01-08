
export class BusinessException extends Error {

    constructor(code: number, message: string) {
        super(JSON.stringify({code, message}));
    }
}
