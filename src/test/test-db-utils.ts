import fs from "fs";
import path from "path";
import { DatabaseService } from "../common/db/database-service";
const mysql = require("mysql2");

export const setupTestData = async (pathUrl: string) => {
    const queries = fs.readFileSync(path.join(__dirname, pathUrl)).toString();
    await executeQuery(queries);
};

export const deleteAllBooks = async () => {
    const query = "TRUNCATE TABLE `library_management`.`books`";
    return await executeQuery(query);
};

export const markBooksReturnedInDbForUser = async (userId: number) => {
    let query = "UPDATE `library_management`.`books_borrowed` SET `is_borrowed` = '0' WHERE (`user_id` = ?)";
    query = mysql.format(query, [userId]);
    return await executeQuery(query);
};

const executeQuery = async (sql: string) => {
    return new DatabaseService().executeQuery(sql);
};
