import { inject, injectable } from "inversify";
import { DatabaseService } from "../common/db/database-service";
import { TYPES } from "../common/fie-types";
import { BookModel } from "../models/book-model";
import { UserBookModel } from "../models/user-book-model";

const mysql = require("mysql2");

@injectable()
export class LibraryMapper {

    constructor(@inject(TYPES.DatabaseService) private db: DatabaseService) {}

    public async getAllBooks(): Promise<BookModel[]> {
        const query = "SELECT * from `library_management`.`books` WHERE available_qty > 0";
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

    private getRows<T>(C: new(args: any) => T, rows: any): T[] {
        const models: T[] = [];
        rows.forEach((row: any) => {
            models.push(new C(row));
        });
        return models;
    }
}
