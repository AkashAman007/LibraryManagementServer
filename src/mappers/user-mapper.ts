import { inject, injectable } from "inversify";
import { DatabaseService } from "../common/db/database-service";
import { TYPES } from "../common/fie-types";
import { UserModel } from "../models/user-model";
const mysql = require("mysql2");

@injectable()
export class UserMapper {
    constructor(@inject(TYPES.DatabaseService) private db: DatabaseService) {}

    public async getUserById(userId: number): Promise<UserModel | null> {
        let query = "SELECT * FROM `library_management`.`users` WHERE id = ?";
        query = mysql.format(query, [userId]);
        const rows = await this.db.executeQuery(query);
        return rows.length > 0 ? new UserModel(rows[0]) : null;
    }
}
