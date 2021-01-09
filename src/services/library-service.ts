import { inject, injectable } from "inversify";
import { TYPES } from "../common/fie-types";
import { LibraryMapper } from "../mappers/library-mapper";

@injectable()
export class LibraryService {

    constructor(@inject(TYPES.LibraryMapper) private libraryMapper: LibraryMapper) {}

    public async getAllBooks() {
        const books = await this.libraryMapper.getAllBooks();
        return books;
    }
}
