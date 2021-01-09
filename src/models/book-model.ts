export class BookModel {
    public id: number;
    public isbn: string;
    public title: string;
    public author: string;
    public availableQty: number;
    public total: string;
    public version: string;
    public imageLink: string;
    public description: string;

    constructor(row: any) {
        this.id = row.id;
        this.isbn = row.isbn;
        this.title = row.title;
        this.author = row.author;
        this.availableQty = row.available_qty;
        this.total = row.total;
        this.version = row.version;
        this.imageLink = row.image_link;
        this.description = row.description;
    }

}
