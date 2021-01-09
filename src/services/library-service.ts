import { inject, injectable } from "inversify";
import { TYPES } from "../common/fie-types";
import { LibraryMapper } from "../mappers/library-mapper";
import { BusinessException } from "../common/exceptions/business-exception";
import { Constants } from "../common/constants";
import { UserMapper } from "../mappers/user-mapper";

@injectable()
export class LibraryService {

    constructor(@inject(TYPES.LibraryMapper) private libraryMapper: LibraryMapper,
                @inject(TYPES.UserMapper) private userMapper: UserMapper) {}

    public async getAllBooks() {
        const books = await this.libraryMapper.getAllBooks();
        return books;
    }

    public async getUserBorrowedBooks(userId: number) {
        const user = await this.getUser(userId);
        const borrowedBooks = this.libraryMapper.getBooksBorrowedByUser(user.id);
        return borrowedBooks;
    }
    
    private async getUser(userId: number) {
        const user = await this.userMapper.getUserById(userId);
        if (!user) {
            throw new BusinessException(Constants.ERROR_CODE.USER_NOT_FOUND,
                 Constants.ERROR_MESSAGE.USER_NOT_FOUND);
        }
        return user;
    }
}
