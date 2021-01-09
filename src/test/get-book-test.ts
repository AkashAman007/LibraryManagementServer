import { expect } from "chai";
import "reflect-metadata";
import request from "supertest";
import { Constants } from "../common/constants";
import { deleteAllBooks, setupTestData } from "./test-db-utils";
import { startTestServer } from "./test-server";

const url = "/api/library/books";
const booksInTestData = 8;

describe("Library Controller getAll Books API", () => {
    const server = startTestServer();
    const app = server.build();
    beforeEach(async () => {
        await setupTestData("./library-test-data.sql");
    });

    describe("a. Get all books", async () => {
        it("1. Fetched Book With Status 200", async () => {
            const res = await request(app).get(url);
            expect(res.status).equals(Constants.SUCCESS_CODE);
            expect(res.body.code).equals(Constants.SUCCESS_CODE);
            expect(res.body.status).equals(true);
        });
    });

    describe("b. Test Book Response Data", async () => {

        it("1. book api returns an array", async () => {
            const res = await request(app).get(url);
            const data = res.body.data;
            expect(data).to.be.an("array").to.have.lengthOf(booksInTestData);
        });

        it("2. book list returns correct properties", async () => {
            const res = await request(app).get(url);
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
            });
        });
    });

    describe("c. Empty Book List", async () => {

        beforeEach(async () => {
            await deleteAllBooks();
        });

        it("1. Returns empty list of books", async () => {
            const res = await request(app).get(url);
            expect(res.status).equals(Constants.SUCCESS_CODE);
            expect(res.body.code).equals(Constants.SUCCESS_CODE);
            expect(res.body.status).equals(true);
        });

        it("2. no books in library", async () => {
            const res = await request(app).get(url);
            const data = res.body.data;
            expect(data).to.be.an("array").to.have.lengthOf(0);
        });
    });

});
