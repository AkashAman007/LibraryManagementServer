import { BookModel } from "./book-model";

export class UserBookModel extends BookModel {
    public userId: number;
    public borrowedDate: Date;

    constructor(row: any) {
        super(row);
        this.userId = row.user_id;
        this.borrowedDate = row.borrowed_date;
    }
}
