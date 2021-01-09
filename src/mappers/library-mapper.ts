import { inject, injectable } from "inversify";
import { DatabaseService } from "../common/db/database-service";
import { TYPES } from "../common/fie-types";
import { BookModel } from "../models/book-model";

const mysql = require("mysql2");

@injectable()
export class LibraryMapper {

    constructor(@inject(TYPES.DatabaseService) private db: DatabaseService) {}

    public async getAllBooks(): Promise<BookModel[]> {
        const query = "SELECT * from `library_management`.`books`";
        const rows = await this.db.executeQuery(query);
        return this.getRows(BookModel, rows);
    }

    private getRows<T>(C: new(args: any) => T, rows: any): T[] {
        const models: T[] = [];
        rows.forEach((row: any) => {
            models.push(new C(row));
        });
        return models;
    }
}
