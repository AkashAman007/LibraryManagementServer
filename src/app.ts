import bodyParser from "body-parser";
import expressValidator from "express-validator";
import "reflect-metadata";
import { logger } from "./common/logger";
import cors from "cors";
import { errorHandler } from "./common/middlewares/error-handler";

const port = process.env.PORT || 7777;

export const appConfig = (app: any) => {
    app.use(cors());
    app.use(bodyParser.json({limit: "1mb"}));       // to support JSON-encoded bodies

    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
      extended: true,
    }));

    app.use(expressValidator({
      errorFormatter(param: any, msg: string, value: any) {
        const namespace = param.split(".");
        const root = namespace.shift();
        let formParam = root;

        while (namespace.length) {
          formParam += "[" + namespace.shift() + "]";
        }
        return {
          msg,
          param: formParam,
          value,
        };
      },
    }));

    app.listen(port, async () => {
      try {
        logger.info(`App listening to port: ${port}`);
      } catch (error) {
        logger.error(`Exception in initialising config :  ${error}, exiting process`);
        process.exit();
      }
    });
};

export const errorConfig = (app: any) => {
  app.use(errorHandler);
};
