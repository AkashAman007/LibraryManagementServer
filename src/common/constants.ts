export class Constants {

    public static readonly ERROR_MESSAGE = {
        BAD_REQUEST: "Bad Request",
        USER_NOT_FOUND: "User Not Found",
        INTERNAL_SERVER_ERROR: "Internal Server Error",
        BOOK_NOT_AVAILABLE: "Book Requested Is Not Available",
        BORROW_LIMIT_REACHED: "Borrow Limit Reached",
        USER_ALREADY_HAS_BOOK: "User Already Has Book",
    };

    public static readonly ERROR_CODE = {
        USER_NOT_FOUND: 1000,
        BORROW_LIMIT_REACHED: 1001,
        USER_ALREADY_HAS_BOOK: 1002,
        BOOK_NOT_AVAILABLE: 1003,
        BAD_REQUEST: 400,
    };

    public static readonly FAILURE_CODE = 500;
    public static readonly SUCCESS_CODE = 200;
    public static readonly SUCCESS_MESSAGE = "OK";

    public static readonly STATUS_CODE = {
        SUCCESS: 200,
        BAD_REQUEST: 400,
        INTERNAL_SERVER_ERROR: 500
    }

    public static readonly BORROW_LIMIT = 2;
}
