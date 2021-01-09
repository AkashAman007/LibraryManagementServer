export class Constants {

    public static readonly ERROR_MESSAGE = {
        BAD_REQUEST: "Bad Request",
        USER_NOT_FOUND: "User Not Found",
        INTERNAL_SERVER_ERROR: "Internal Server Error",
        BOOK_NOT_AVAILABLE: "Book Requested Is Not Available",
        BORROW_LIMIT_REACHED: "Borrow Limit Reached",
        USER_ALREADY_HAS_BOOK: "User Already Has Book",
        RETURNED_BOOKS_NOT_AVAILABLE_WITH_USER: "User Does Not Have Book To Be Returned",
        RETURNED_BOOKS_ARE_INVALID: "Books To Be Returned Are Invalid",
    };

    public static readonly ERROR_CODE = {
        USER_NOT_FOUND: 1000,
        BORROW_LIMIT_REACHED: 1001,
        USER_ALREADY_HAS_BOOK: 1002,
        BOOK_NOT_AVAILABLE: 1003,
        RETURNED_BOOKS_NOT_AVAILABLE_WITH_USER: 1004,
        RETURNED_BOOKS_ARE_INVALID: 1005,
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
