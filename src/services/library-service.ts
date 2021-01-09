import { inject, injectable } from "inversify";
import { TYPES } from "../common/fie-types";
import { LibraryMapper } from "../mappers/library-mapper";
import { BusinessException } from "../common/exceptions/business-exception";
import { Constants } from "../common/constants";
import { UserMapper } from "../mappers/user-mapper";
import { BookModel } from "../models/book-model";
import { UserBookModel } from "../models/user-book-model";

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

    public async borrowBook(userId: number, bookId: number) {
        const user = await this.getUser(userId);
        const [ borrowedBooks, book] = await Promise.all([
                this.libraryMapper.getBooksBorrowedByUser(user.id),
                this.libraryMapper.getBookById(bookId),
            ],
        );
        this.checkIfBookIsAvailaible(book);
        this.checkBookBorrowingEligibility(borrowedBooks, book!);
        await this.libraryMapper.borrowBookForUser(userId, bookId, user.version);
        return { borrowed: bookId };
    }

    private checkIfBookIsAvailaible(book: BookModel | null) {
        if (!book || book.availableQty === 0) {
            throw new BusinessException(Constants.ERROR_CODE.BOOK_NOT_AVAILABLE,
                Constants.ERROR_MESSAGE.BOOK_NOT_AVAILABLE);
        }
    }

    private checkBookBorrowingEligibility(borrowedBooks: UserBookModel[], book: BookModel) {
        this.checkBorrowLimit(borrowedBooks);
        this.checkIfBookAlreadyBorrowedByUser(borrowedBooks, book!);
    }

    private checkBorrowLimit(borrowedBooks: UserBookModel[]) {
        if (borrowedBooks.length >= Constants.BORROW_LIMIT) {
            throw new BusinessException(Constants.ERROR_CODE.BORROW_LIMIT_REACHED,
                Constants.ERROR_MESSAGE.BORROW_LIMIT_REACHED);
        }
    }

    private checkIfBookAlreadyBorrowedByUser(borrowedBooks: UserBookModel[], book: BookModel) {
        const userHasCopy = borrowedBooks.some((borrowedBook) => borrowedBook.id === book.id);
        if (userHasCopy) {
            throw new BusinessException(Constants.ERROR_CODE.USER_ALREADY_HAS_BOOK,
                Constants.ERROR_MESSAGE.USER_ALREADY_HAS_BOOK);
        }
    }
}
