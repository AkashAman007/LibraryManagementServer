import { expect } from "chai";
import "reflect-metadata";
import request from "supertest";
import { Constants } from "../common/constants";
import { markBooksReturnedInDbForUser, setupTestData } from "./test-db-utils";
import { startTestServer } from "./test-server";

const url = "/api/library/books/user";
const INVALID_USER = -1;
const VALID_USER = 1;
const USER_WITH_NO_BOOK_BORROWED = 2;

describe("Library Controller getUser Books API", () => {

    const app = startTestServer();

    beforeEach(async () => {
        await setupTestData("./library-test-data.sql");
    });

    describe("a. get user books validations", async () => {
        it("1. get book for non member", async () => {
            const requestUrl = url + "?userId=" + INVALID_USER;
            const res = await request(app).get(requestUrl);
            expect(res.status).equals(Constants.STATUS_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.USER_NOT_FOUND);
            expect(res.body.status).equals(false);
        });
        it("2. get book for valid user", async () => {
            const requestUrl = url + "?userId=" + VALID_USER;
            const res = await request(app).get(requestUrl);
            expect(res.status).equals(Constants.STATUS_CODE.SUCCESS);
            expect(res.body.code).equals(Constants.STATUS_CODE.SUCCESS);
            expect(res.body.status).equals(true);
        });
        it("3. missing userId params", async () => {
            const requestUrl = url;
            const res = await request(app).get(requestUrl);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.status).equals(false);
        });
        it("4. userId with invalid data type", async () => {
            const requestUrl = url + "?userId=abc";
            const res = await request(app).get(requestUrl);
            expect(res.status).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.code).equals(Constants.ERROR_CODE.BAD_REQUEST);
            expect(res.body.status).equals(false);
        });
    });

    describe("b. Test User Book Response Data", async () => {

        it("1. user book api returns an array", async () => {
            const requestUrl = url + "?userId=" + VALID_USER;
            const res = await request(app).get(requestUrl);
            expect(res.status).equals(Constants.STATUS_CODE.SUCCESS);
            const data = res.body.data;
            expect(data).to.be.an("array");
        });

        it("2. user book list returns correct properties", async () => {
            const requestUrl = url + "?userId=" + VALID_USER;
            const res = await request(app).get(requestUrl);
            expect(res.status).equals(Constants.STATUS_CODE.SUCCESS);
            const data = res.body.data;
            data.map((book: any) => {
                expect(book).to.have.ownProperty("id").to.be.a("number");
                expect(book).to.have.ownProperty("isbn").to.be.a("string");
                expect(book).to.have.ownProperty("title").to.be.a("string");
                expect(book).to.have.ownProperty("author").to.be.a("string");
                expect(book).to.have.ownProperty("availableQty").to.be.a("number");
                expect(book).to.have.ownProperty("total").to.be.a("number");
                expect(book).to.have.ownProperty("version").to.be.a("number");
                expect(book).to.have.ownProperty("imageLink").to.be.a("string");
                expect(book).to.have.ownProperty("description").to.be.a("string");
                expect(book).to.have.ownProperty("description").to.be.a("string");
                expect(book).to.have.ownProperty("userId").to.be.a("number").equal(VALID_USER);
                expect(book).to.have.ownProperty("borrowedDate").to.not.be.empty;
            });
        });
    });

    describe("c. Empty Book List For User", async () => {

        it("1. Returns empty list of books when user has not borrowed any", async () => {
            const requestUrl = url + "?userId=" + USER_WITH_NO_BOOK_BORROWED;
            const res = await request(app).get(requestUrl);
            const data = res.body.data;
            expect(res.status).equals(Constants.SUCCESS_CODE);
            expect(res.body.code).equals(Constants.SUCCESS_CODE);
            expect(res.body.status).equals(true);
            expect(data).to.be.an("array").to.have.lengthOf(0);
        });

        it("2. after books returned by user", async () => {
            await markBooksReturnedInDbForUser(VALID_USER);
            const requestUrl = url + "?userId=" + VALID_USER;
            const res = await request(app).get(requestUrl);
            const data = res.body.data;
            expect(res.status).equals(Constants.SUCCESS_CODE);
            expect(res.body.code).equals(Constants.SUCCESS_CODE);
            expect(res.body.status).equals(true);
            expect(data).to.be.an("array").to.have.lengthOf(0);
        });
    });

});
