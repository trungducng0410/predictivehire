import { HttpError } from "./../errors/http.error";
import { IUser } from "./../interface/users.interface";
const PASSWORD_MIN_LENGTH = 8;

export class User {
    public email: string;
    public password: string;

    constructor(email: string, password: string) {
        if (this.validateEmail(email)) {
            this.email = email;
        } else {
            throw new HttpError(400, "Invalid email");
        }

        if (this.validatePassword(password)) {
            this.password = password;
        } else {
            throw new HttpError(400, "Invalid password");
        }
    }

    private validateEmail(email: string): boolean {
        const re =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    private validatePassword(password: string): boolean {
        return password.length >= PASSWORD_MIN_LENGTH;
    }
}
