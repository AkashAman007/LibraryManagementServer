import { expect } from "chai";
import "reflect-metadata";
import request from "supertest";
import { Constants } from "../common/constants";
import { markBookAsUnavaiableInDb, removeAllBorrowedBooksForUser, setupTestData } from "./test-db-utils";
import { startTestServer } from "./test-server";

const url = "/api/library/books/borrow";
const getUserBookUrl = "/api/library/books/user";
const getBookUrl = "/api/library/books";
const INVALID_USER = -1;
const VALID_USER = 1;
const AVAILABLE_BOOK_IDS = [1, 2, 3, 4, 5, 6, 7, 8];
const INVALID_BOOK_ID = 100;

describe("Library Controller Borrow Books API", () => {

    const app = startTestServer();

    beforeEach(async () => {
        await setupTestData("./scripts/library-test-data.sql");
        await removeAllBorrowedBooksForUser();
    });

    describe("a. api request body validation", async () => {
        it("1. userId and bookId missing", async () => {
            const requestUrl = url;
            const reqBody = {};
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.status).equals(false);
        });
        it("2. userId missing", async () => {
            const requestUrl = url;
            const reqBody = {
                bookId: AVAILABLE_BOOK_IDS[0],
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.status).equals(false);
        });
        it("3. bookId missing", async () => {
            const requestUrl = url;
            const reqBody = {
                bookId: AVAILABLE_BOOK_IDS[0],
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.status).equals(false);
        });
        it("4. incorrect userId data type", async () => {
            const requestUrl = url;
            const reqBody = {
                bookId: AVAILABLE_BOOK_IDS[0],
                userId: "abc",
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.status).equals(false);
        });
        it("5. incorrect bookId data type", async () => {
            const requestUrl = url;
            const reqBody = {
                bookId: "xyz",
                userId: VALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.status).equals(false);
        });
        it("6. api call with valid params", async () => {
            const requestUrl = url;
            const reqBody = {
                bookId: AVAILABLE_BOOK_IDS[0],
                userId: VALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.STATUS_CODE.SUCCESS);
            expect(res.body.code).equals(Constants.STATUS_CODE.SUCCESS);
            expect(res.body.status).equals(true);
        });
    });

    describe("b. api request for invalid user or for invalid books", async () => {
        it("1. borrow request for user who is not a member", async () => {
            const requestUrl = url;
            const reqBody = {
                bookId: AVAILABLE_BOOK_IDS[0],
                userId: INVALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.USER_NOT_FOUND);
            expect(res.body.status).equals(false);
        });
        it("2. borrow request for book which is not present in library", async () => {
            const requestUrl = url;
            const reqBody = {
                bookId: INVALID_BOOK_ID,
                userId: VALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BOOK_NOT_AVAILABLE);
            expect(res.body.status).equals(false);
        });
        it("3. borrow request for book whose copy is not available", async () => {
            await markBookAsUnavaiableInDb(AVAILABLE_BOOK_IDS[0]);
            const requestUrl = url;
            const reqBody = {
                bookId: AVAILABLE_BOOK_IDS[0],
                userId: VALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BOOK_NOT_AVAILABLE);
            expect(res.body.status).equals(false);
        });
    });

    describe("c. sucessfully borrowed book", async () => {

        beforeEach(async () => {
            await removeAllBorrowedBooksForUser();
        });

        it("1. returns success ", async () => {
            const requestUrl = url;
            const reqBody = {
                bookId: AVAILABLE_BOOK_IDS[0],
                userId: VALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.SUCCESS_CODE);
            expect(res.body.code).equals(Constants.SUCCESS_CODE);
            expect(res.body.status).equals(true);
        });

        it("2. available qty to decrement by 1 on success", async () => {
            const bookId = AVAILABLE_BOOK_IDS[1];
            let resBookList = await request(app).get(getBookUrl);
            let bookList = resBookList.body.data;
            const availableQtyBeforeBookIsBorrowed = bookList
                                                        .filter((book: any) => book.id === bookId)
                                                        .map((book: any) => book.availableQty)[0];
            const requestUrl = url;
            const reqBody = {
                bookId,
                userId: VALID_USER,
            };
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.SUCCESS_CODE);
            expect(res.body.code).equals(Constants.SUCCESS_CODE);
            expect(res.body.status).equals(true);
            resBookList = await request(app).get(getBookUrl);
            bookList = resBookList.body.data;
            const availableQtyAfterBookIsBorrowed = bookList
                                                        .filter((book: any) => book.id === bookId)
                                                        .map((book: any) => book.availableQty)[0];
            expect(availableQtyBeforeBookIsBorrowed).equals(availableQtyAfterBookIsBorrowed + 1);
        });

        it("3. user owns copy after successful borrow", async () => {
            const bookId = AVAILABLE_BOOK_IDS[2];
            const requestUrl = url;
            const reqBody = {
                bookId,
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
            const userHasCopy = userBooks.some((book: any) => book.id === bookId);
            expect(userHasCopy).to.be.true;
        });
    });

    describe("d. borrow limit test", async () => {

        beforeEach(async () => {
            await removeAllBorrowedBooksForUser();
        });

        it("1. success on borrowing book less than limit", async () => {
            const requestUrl = url;
            const reqBody = {
                bookId: AVAILABLE_BOOK_IDS[0],
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
            expect(userBooks.length).to.be.lte(Constants.BORROW_LIMIT);
        });

        it("2. failure on borrowing more than limit", async () => {
            const requestUrl = url;
            const reqBody = {
                bookId: AVAILABLE_BOOK_IDS[0],
                userId: VALID_USER,
            };
            await request(app).post(requestUrl).send(reqBody);
            reqBody.bookId = AVAILABLE_BOOK_IDS[1];
            await request(app).post(requestUrl).send(reqBody);

            reqBody.bookId = AVAILABLE_BOOK_IDS[2];
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BORROW_LIMIT_REACHED);
            expect(res.body.status).equals(false);

            const getUserListingUrl = getUserBookUrl + "?userId=" + VALID_USER;
            const userBookResponse = await request(app).get(getUserListingUrl);
            expect(userBookResponse.status).equals(Constants.STATUS_CODE.SUCCESS);
            const userBooks = userBookResponse.body.data;
            expect(userBooks.length).to.be.equal(Constants.BORROW_LIMIT);
        });
    });

    describe("d. borrow wehn user owns copy of the book", async () => {

        beforeEach(async () => {
            await removeAllBorrowedBooksForUser();
        });

        it("1. failure on borrowing ", async () => {
            const bookToBeBorrowed = AVAILABLE_BOOK_IDS[0];
            const requestUrl = url;
            const reqBody = {
                bookId: bookToBeBorrowed,
                userId: VALID_USER,
            };
            await request(app).post(requestUrl).send(reqBody);
            const res = await request(app).post(requestUrl).send(reqBody);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.USER_ALREADY_HAS_BOOK);
            expect(res.body.status).equals(false);
            const getUserListingUrl = getUserBookUrl + "?userId=" + VALID_USER;
            const userBookResponse = await request(app).get(getUserListingUrl);
            expect(userBookResponse.status).equals(Constants.STATUS_CODE.SUCCESS);
            const userBooks = userBookResponse.body.data;
            const copyOfBooks = userBooks.filter((book: any) => book.id === bookToBeBorrowed);
            expect(copyOfBooks.length).equal(1);
        });
    });

});
