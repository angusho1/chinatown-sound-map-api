export default class HttpError extends Error {
    public status: number;
    public data: any;

    constructor(status, message, data) {
        super(message);
        this.status = status;
        this.message = message;
        this.data = data;
    }
}