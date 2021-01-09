import { expect } from "chai";
import "reflect-metadata";
import request from "supertest";
import { Constants } from "../common/constants";
import { removeAllBorrowedBooksForUser, setupTestData } from "./test-db-utils";
import { startTestServer } from "./test-server";

const borrwBookUrl = "/api/library/books/borrow";
const returnBookUrl = "/api/library/books/return";
const getUserBookUrl = "/api/library/books/user";
const getBookUrl = "/api/library/books";
const INVALID_USER = -1;
const VALID_USER = 1;
const AVAILABLE_BOOK_IDS = [1, 2, 3, 4, 5, 6, 7, 8];
const INVALID_BOOK_ID = 100;

describe("Library Controller Return Books API", () => {

    const app = startTestServer();

    beforeEach(async () => {
        await setupTestData("./library-test-data.sql");
        await removeAllBorrowedBooksForUser();
    });

    describe("a. api request body validation", async () => {
        beforeEach(async () => {
            const reqBody = {
                bookId: AVAILABLE_BOOK_IDS[0],
                userId: VALID_USER,
            };
            await request(app).post(borrwBookUrl).send(reqBody);
        });

        it("1. userId and bookIds missing", async () => {
            const requestUrl = returnBookUrl;
            const reqBody = {};
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.status).equals(false);
        });
        it("2. userId missing", async () => {
            const requestUrl = returnBookUrl;
            const reqBody = {
                bookIds: [AVAILABLE_BOOK_IDS[0]],
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.status).equals(false);
        });
        it("3. bookIds missing", async () => {
            const requestUrl = returnBookUrl;
            const reqBody = {
                bookIds: [AVAILABLE_BOOK_IDS[0]],
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.status).equals(false);
        });
        it("4. incorrect userId data type", async () => {
            const requestUrl = returnBookUrl;
            const reqBody = {
                bookIds: [AVAILABLE_BOOK_IDS[0]],
                userId: "abc",
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.status).equals(false);
        });
        it("5. incorrect bookIds data type", async () => {
            const requestUrl = returnBookUrl;
            const reqBody = {
                bookIds: "xyz",
                userId: VALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.status).equals(false);
        });
        it("6. api call with valid params", async () => {
            const requestUrl = returnBookUrl;
            const reqBody = {
                bookIds: [AVAILABLE_BOOK_IDS[0]],
                userId: VALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.STATUS_CODE.SUCCESS);
            expect(res.body.code).equals(Constants.STATUS_CODE.SUCCESS);
            expect(res.body.status).equals(true);
        });
    });

    describe("b. api request for invalid user or for invalid books", async () => {
        before(async () => {
            const reqBody = {
                bookId: AVAILABLE_BOOK_IDS[0],
                userId: VALID_USER,
            };
            await request(app).post(borrwBookUrl).send(reqBody);
        });
        it("1. return request for user who is not a member", async () => {
            const requestUrl = returnBookUrl;
            const reqBody = {
                bookIds: [AVAILABLE_BOOK_IDS[0]],
                userId: INVALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.USER_NOT_FOUND);
            expect(res.body.status).equals(false);
        });
        it("2. return request for book which is not present in library", async () => {
            const requestUrl = returnBookUrl;
            const reqBody = {
                bookIds: [INVALID_BOOK_ID],
                userId: VALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.RETURNED_BOOKS_ARE_INVALID);
            expect(res.body.status).equals(false);
        });
        it("2. return request for book which is not borrowed by user", async () => {
            const requestUrl = returnBookUrl;
            const reqBody = {
                bookIds: [AVAILABLE_BOOK_IDS[1]],
                userId: VALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.RETURNED_BOOKS_NOT_AVAILABLE_WITH_USER);
            expect(res.body.status).equals(false);
        });
    });

    describe("c. sucessfully returned book", async () => {
        const bookReturned = AVAILABLE_BOOK_IDS[0];
        beforeEach(async () => {
            const reqBody = {
                bookId: bookReturned,
                userId: VALID_USER,
            };
            await request(app).post(borrwBookUrl).send(reqBody);
        });

        it("1. return book success ", async () => {
            const requestUrl = returnBookUrl;
            const reqBody = {
                bookIds: [bookReturned],
                userId: VALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.SUCCESS_CODE);
            expect(res.body.code).equals(Constants.SUCCESS_CODE);
            expect(res.body.status).equals(true);
        });

        it("2. available qty to increment by 1 on success", async () => {
            let resBookList = await request(app).get(getBookUrl);
            let bookList = resBookList.body.data;
            const availableQtyBeforeBookIsReturned = bookList
                                                        .filter((book: any) => book.id === bookReturned)
                                                        .map((book: any) => book.availableQty)[0];
            const requestUrl = returnBookUrl;
            const reqBody = {
                bookIds: [bookReturned],
                userId: VALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.SUCCESS_CODE);
            expect(res.body.code).equals(Constants.SUCCESS_CODE);
            expect(res.body.status).equals(true);
            resBookList = await request(app).get(getBookUrl);
            bookList = resBookList.body.data;
            const availableQtyAfterBookIsReturned = bookList
                                                        .filter((book: any) => book.id === bookReturned)
                                                        .map((book: any) => book.availableQty)[0];
            expect(availableQtyBeforeBookIsReturned + 1).equals(availableQtyAfterBookIsReturned);
        });

        it("3. user does not owns copy after successful return", async () => {
            const requestUrl = returnBookUrl;
            const reqBody = {
                bookIds: [bookReturned],
                userId: VALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.SUCCESS_CODE);
            expect(res.body.code).equals(Constants.SUCCESS_CODE);
            expect(res.body.status).equals(true);
            const getUserListingUrl = getUserBookUrl + "?userId=" + VALID_USER;
            const userBookResponse = await request(app).get(getUserListingUrl);
            expect(userBookResponse.status).equals(Constants.STATUS_CODE.SUCCESS);
            const userBooks = userBookResponse.body.data;
            const userHasCopy = userBooks.some((book: any) => book.id === bookReturned);
            expect(userHasCopy).to.be.false;
        });
    });
});
