import { HttpError } from "../../../src/errors/http.error";
import { User } from "../../../src/models/user.model";

describe("User", () => {
    it("should throw error with invalid email", () => {
        expect(() => new User("invalid@", "password")).toThrow(
            new HttpError(400, "Invalid email")
        );
    });

    it("should throw error with invalid password", () => {
        expect(() => new User("test@email.com", "pass")).toThrow(
            new HttpError(400, "Invalid password")
        );
    });

    it("should create new user valid email and password", () => {
        const user = new User("test@email.com", "password");
        expect(user.email).toBe("test@email.com");
        expect(user.password).toBe("password");
    });
});
