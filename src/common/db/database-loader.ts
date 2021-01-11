import { DatabaseService } from "./database-service";
import fs from "fs";
import path from "path";

export class DataBaseLoader {

    public static Load() {
        const queries = fs.readFileSync(path.join(__dirname, "../../../src/test/scripts/library-data.sql")).toString();
        new DatabaseService().executeQuery(queries);
    }
}