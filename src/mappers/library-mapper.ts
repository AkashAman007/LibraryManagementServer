import { inject, injectable } from "inversify";
import { DatabaseService } from "../common/db/database-service";
import { TYPES } from "../common/fie-types";
import { BookModel } from "../models/book-model";
import { UserBookModel } from "../models/user-book-model";

const mysql = require("mysql2");

@injectable()
export class LibraryMapper {

    constructor(@inject(TYPES.DatabaseService) private db: DatabaseService) {}

    public async getAvaialbleBooksInLibrary(): Promise<BookModel[]> {
        const query = "SELECT * from `library_management`.`books` WHERE available_qty > 0";
        const rows = await this.db.executeQuery(query);
        return this.getRows(BookModel, rows);
    }

    public async getBookById(bookId: number): Promise<BookModel | null> {
        const books = await this.getBooksByIds([bookId]);
        return books.length > 0 ? books[0] : null;
    }

    public async getBooksByIds(bookIds: number[]): Promise<BookModel[]> {
        let query = "SELECT * from `library_management`.`books` WHERE id IN (?) ";
        query = mysql.format(query, [bookIds]);
        const rows = await this.db.executeQuery(query);
        return this.getRows(BookModel, rows);
    }

    public async getBooksBorrowedByUser(userId: number): Promise<UserBookModel[]> {
        let query = "SELECT b.*, bb.user_id, bb.borrowed_date FROM library_management.books_borrowed as bb LEFT JOIN library_management.books as b " +
        "ON bb.book_id = b.id WHERE bb.user_id = ? AND bb.is_borrowed = 1";
        query = mysql.format(query, [userId]);
        const rows = await this.db.executeQuery(query);
        return this.getRows(UserBookModel, rows);
    }

    public async getBooksBorrowedByUserByIds(userId: number, bookIds: number[]): Promise<UserBookModel[]> {
        let query = "SELECT b.*, bb.user_id, bb.borrowed_date FROM library_management.books_borrowed as bb LEFT JOIN library_management.books as b " +
        "ON bb.book_id = b.id WHERE bb.user_id = ? AND bb.book_id IN (?) AND bb.is_borrowed = 1";
        query = mysql.format(query, [userId, bookIds]);
        const rows = await this.db.executeQuery(query);
        return this.getRows(UserBookModel, rows);
    }

    public async borrowBookForUser(userId: number, bookId: number, userVersion: number) {
        const queries = [];
        let bookUpdateQuery = "UPDATE `library_management`.`books` SET `available_qty` = available_qty - 1 WHERE id = ? AND available_qty > 0";
        bookUpdateQuery = mysql.format(bookUpdateQuery, [bookId]);
        queries.push(bookUpdateQuery);
        let userUpdateQuery = "UPDATE `library_management`.`users` SET version = version + 1 WHERE id = ? AND version = ?";
        userUpdateQuery = mysql.format(userUpdateQuery, [userId, userVersion]);
        queries.push(userUpdateQuery);
        let insertBookForUserQuery = "INSERT INTO `library_management`.`books_borrowed` (`user_id`, `book_id`, `is_borrowed`) VALUES (?,?,'1')";
        insertBookForUserQuery = mysql.format(insertBookForUserQuery, [userId, bookId]);
        queries.push(insertBookForUserQuery);
        return await this.db.executeTransactionalQueries(queries);
    }

    public async returnBooksForUser(userId: number, bookIds: number[], userVersion: number) {
        const queries = [];
        let bookUpdateQuery = "UPDATE `library_management`.`books` SET `available_qty` = available_qty + 1 WHERE id IN (?)";
        bookUpdateQuery = mysql.format(bookUpdateQuery, [bookIds]);
        queries.push(bookUpdateQuery);
        let userUpdateQuery = "UPDATE `library_management`.`users` SET version = version + 1 WHERE id = ? AND version = ?";
        userUpdateQuery = mysql.format(userUpdateQuery, [userId, userVersion]);
        queries.push(userUpdateQuery);
        let returnBookQuery = "UPDATE `library_management`.`books_borrowed` SET is_borrowed = 0 WHERE user_id = ? AND book_id IN (?)";
        returnBookQuery = mysql.format(returnBookQuery, [userId, bookIds]);
        queries.push(returnBookQuery);
        return await this.db.executeTransactionalQueries(queries);
    }

    private getRows<T>(C: new(args: any) => T, rows: any): T[] {
        const models: T[] = [];
        rows.forEach((row: any) => {
            models.push(new C(row));
        });
        return models;
    }
}
