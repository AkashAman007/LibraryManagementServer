import { Container } from "inversify";
import { DatabaseService } from "./db/database-service";
import { TYPES } from "./fie-types";
import { LibraryService } from "../services/library-service";
import { LibraryMapper } from "../mappers/library-mapper";

export class ContainerConfigLoader {
    public static Load(): Container {
        const container = new Container();
        container.bind<LibraryService>(TYPES.LibraryService).to(LibraryService).inSingletonScope();
        container.bind<DatabaseService>(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();
        container.bind<LibraryMapper>(TYPES.LibraryMapper).to(LibraryMapper).inSingletonScope();
        return container;
    }
}
