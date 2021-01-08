import { injectable } from "inversify";
import { DBException } from "../exceptions/db-exception";
import { logger } from "../logger";

@injectable()
export class DatabaseService {

    public static dbPool: any;

    public static initialize() {
        const dbUrl = process.env.DB_URL || "localhost";
        const dbPassword = process.env.DB_PASSWORD || "root";
        const dbUsername = process.env.DB_USERNAME || "root";
        if (!(dbUrl || dbPassword || dbUsername)) {
            logger.error(`Missing Database Configuration Parameters. Could Not initialize connection`);
        }
        const experimentDbPoolConfig = {
            connectTimeout: 10000,
            connectionLimit: 20,
            host: dbUrl,
            multipleStatements: true,
            password: dbPassword,
            user: dbUsername,
            waitForConnections: true,
        };
        const mysql = require("mysql2");
        const pool = mysql.createPool(experimentDbPoolConfig);
        DatabaseService.dbPool = pool.promise();
    }

    public async executeQuery(query: string) {
        try {
            logger.info(`Running query : ${query}`);
            const [rows] = await DatabaseService.dbPool.query(query);
            return rows;
        } catch (err) {
            logger.error("error : " + err.stack);
            throw new DBException("Db query error");
        }
    }

    public async executeTransactionalQueries(queries: string[]) {
        const conn = await DatabaseService.dbPool.getConnection();
        try {
            await conn.beginTransaction();
            for (const query of queries) {
                logger.info(`Running query : ${query}`);
                const [rows] = await conn.query(query);
                if (rows.affectedRows === 0) {
                    throw new DBException("Db Transaction Failed");
                }
            }
            await conn.commit();
            await conn.release();
            return;
        } catch (err) {
            await conn.rollback();
            await conn.release();
            throw err;
        }
    }

}
