export class UserModel {
    public id: number;
    public fullName: string;
    public contactNumber: string;
    public booksBorrowed: string;
    public version: number;

    constructor(row: any) {
        this.id = row.id;
        this.fullName = row.fullname;
        this.contactNumber = row.contact_number;
        this.booksBorrowed = row.books_borrowed;
        this.version = row.version;
    }
}
