import { NextFunction, Request, Response } from "express";
import { inject } from "inversify";
import {  BaseHttpController, controller, httpGet, httpPost} from "inversify-express-utils";
import { TYPES } from "../common/fie-types";
import { LibraryService } from "../services/library-service";
import { Constants } from "../common/constants";
import { successResponse } from "../common/response-helper";
import { BusinessException } from "../common/exceptions/business-exception";
const _ = require("lodash");

@controller("/library")
export class LibraryController extends BaseHttpController {

    constructor( @inject(TYPES.LibraryService) private libraryService: LibraryService) {
        super();
    }

    @httpGet("/books")
    public async getBooks(req: Request, res: Response, next: NextFunction) {
        const response = await this.libraryService.getAllBooks();
        return res.status(Constants.STATUS_CODE.SUCCESS).send(successResponse(response));
    }

    @httpGet("/books/user")
    public async getUserBorrowedBooks(req: Request, res: Response, next: NextFunction) {
        req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
        req.assert("userId", "Invalid UserId").notEmpty().isInt();
        const errors = req.validationErrors();
        if (errors) {
            throw new BusinessException(Constants.ERROR_CODE.BAD_REQUEST, `${JSON.stringify(errors)}`);
        }
        const response = await this.libraryService.getUserBorrowedBooks(parseInt(req.params.userId));
        return res.status(Constants.STATUS_CODE.SUCCESS).send(successResponse(response));
    }

    @httpPost("/books/borrow")
    public async borrowBook(req: Request, res: Response, next: NextFunction) {
        req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
        req.assert("userId", "Invalid UserId").notEmpty().isInt();
        req.assert("bookId", "Invalid BookId").notEmpty().isInt();
        const errors = req.validationErrors();
        if (errors) {
            throw new BusinessException(Constants.ERROR_CODE.BAD_REQUEST, `${JSON.stringify(errors)}`);
        }
        const response = await this.libraryService.borrowBook(parseInt(req.params.userId), parseInt(req.params.bookId));
        return res.status(Constants.STATUS_CODE.SUCCESS).send(successResponse(response));
    }

    @httpPost("/books/return")
    public async returnBooks(req: Request, res: Response, next: NextFunction) {
        req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
        req.assert("userId", "Invalid UserId").notEmpty().isInt();
        req.assert("bookIds", "Invalid BookId").notEmpty().isArray();
        const errors = req.validationErrors();
        if (errors) {
            throw new BusinessException(Constants.ERROR_CODE.BAD_REQUEST, `${JSON.stringify(errors)}`);
        }
        const bookIds = [...req.params.bookIds].map((bookId) => parseInt(bookId));
        const response = await this.libraryService.returnBooks(parseInt(req.params.userId), bookIds);
        return res.status(Constants.STATUS_CODE.SUCCESS).send(successResponse(response));
    }
}
