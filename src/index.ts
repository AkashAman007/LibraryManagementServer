import "reflect-metadata";
import { InversifyExpressServer } from "inversify-express-utils";
import { appConfig, errorConfig } from "./app";
import { ContainerConfigLoader } from "./common/container";
import { DatabaseService } from "./common/db/database-service";
import "./controllers/library-controller";

DatabaseService.initialize();
const container = ContainerConfigLoader.Load();

const server = new InversifyExpressServer(container, null, { rootPath: "/api" }, null);
server.setConfig(appConfig)
      .setErrorConfig(errorConfig)
      .build();

export default server;
