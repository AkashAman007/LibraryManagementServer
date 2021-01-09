import fs from "fs";
import path from "path";
import { DatabaseService } from "../common/db/database-service";

export const setupTestData = async (pathUrl: string) => {
    const queries = fs.readFileSync(path.join(__dirname, pathUrl)).toString();
    await executeQuery(queries);
};

export const deleteAllBooks = async () => {
    const query = "TRUNCATE TABLE `library_management`.`books`";
    return await executeQuery(query);
};

const executeQuery = async (sql: string) => {
    return new DatabaseService().executeQuery(sql);
};
