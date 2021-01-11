import "reflect-metadata";
import { InversifyExpressServer } from "inversify-express-utils";
import { appConfig, errorConfig } from "./app";
import { ContainerConfigLoader } from "./common/container";
import { DatabaseService } from "./common/db/database-service";
import "./controllers/library-controller";
import { DataBaseLoader } from "./common/db/database-loader";

DatabaseService.initialize();

DataBaseLoader.Load(); // to load data for testing purpose

const container = ContainerConfigLoader.Load();

const server = new InversifyExpressServer(container, null, { rootPath: "/api" }, null);
server.setConfig(appConfig)
      .setErrorConfig(errorConfig)
      .build();

export default server;
