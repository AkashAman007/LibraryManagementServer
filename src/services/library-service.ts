import { inject, injectable } from "inversify";
import { TYPES } from "../common/fie-types";
import { LibraryMapper } from "../mappers/library-mapper";
import { BusinessException } from "../common/exceptions/business-exception";
import { Constants } from "../common/constants";
import { UserMapper } from "../mappers/user-mapper";
import { BookModel } from "../models/book-model";
import { UserBookModel } from "../models/user-book-model";
const _ = require("lodash");

@injectable()
export class LibraryService {

    constructor(@inject(TYPES.LibraryMapper) private libraryMapper: LibraryMapper,
                @inject(TYPES.UserMapper) private userMapper: UserMapper) {}

    public async getAllBooks() {
        const books = await this.libraryMapper.getAvaialbleBooksInLibrary();
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

    public async returnBooks(userId: number, bookIds: number[]) {
        const user = await this.getUser(userId);
        const [ borrowedBooks, booksToReturn] = await Promise.all([
                this.libraryMapper.getBooksBorrowedByUserByIds(user.id, bookIds),
                this.libraryMapper.getBooksByIds(bookIds),
            ],
        );
        this.checkIfReturnIsValid(bookIds, borrowedBooks, booksToReturn);
        await this.libraryMapper.returnBooksForUser(userId, bookIds, user.version);
        return { booksReturned: bookIds };
    }

    private checkIfReturnIsValid(bookIds: number[], borrowedBooks: UserBookModel[], booksToReturn: BookModel[]) {
        this.checkIfBooksToBeReturnedAreValid(bookIds, booksToReturn);
        this.checkIfUserHasTheBookToBeReturned(bookIds, borrowedBooks);
    }

    private checkIfBooksToBeReturnedAreValid(bookIds: number[], availableBooks: BookModel[]) {
        const availableBookIds = availableBooks.map((availableBook) => availableBook.id);
        const isEqual = _.isEqual(bookIds.sort(), availableBookIds.sort());
        if (!isEqual) {
            throw new BusinessException(Constants.ERROR_CODE.RETURNED_BOOKS_ARE_INVALID,
                 Constants.ERROR_MESSAGE.RETURNED_BOOKS_ARE_INVALID);
        }
    }

    private checkIfUserHasTheBookToBeReturned(bookIds: number[], borrowedBooks: UserBookModel[]) {
        const borrowedBookIds = borrowedBooks.map((borrowedBook) => borrowedBook.id);
        const isEqual = _.isEqual(bookIds.sort(), borrowedBookIds.sort());
        if (!isEqual) {
            throw new BusinessException(Constants.ERROR_CODE.RETURNED_BOOKS_NOT_AVAILABLE_WITH_USER,
                 Constants.ERROR_MESSAGE.RETURNED_BOOKS_NOT_AVAILABLE_WITH_USER);
        }
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
