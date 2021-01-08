import { NextFunction, Request, Response } from "express";
import { inject } from "inversify";
import {  BaseHttpController, controller, httpGet, httpPost} from "inversify-express-utils";
import { TYPES } from "../common/fie-types";
import { LibraryService } from "../services/library-service";
const _ = require("lodash");

@controller("/library")
export class LibraryController extends BaseHttpController {

    constructor( @inject(TYPES.LibraryService) private libraryService: LibraryService) {
        super();
    }

    @httpGet("/books")
    public async getBooks(req: Request, res: Response, next: NextFunction) {
    
    }

    @httpGet("/books/user")
    public async getUserBorrowedBooks(req: Request, res: Response, next: NextFunction) {

    }

    @httpPost("/books/borrow")
    public async borrowBook(req: Request, res: Response, next: NextFunction) {


    }

    @httpPost("/books/return")
    public async returnBooks(req: Request, res: Response, next: NextFunction) {

    }
}
