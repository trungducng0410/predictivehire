export class LoginLog {
    public email: string;
    public status: string;
    public timestamp: number;

    constructor(email: string, status: string) {
        this.email = email;
        this.status = status;
        this.timestamp = Date.now();
    }
}
