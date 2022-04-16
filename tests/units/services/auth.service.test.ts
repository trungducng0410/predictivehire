import { HttpError } from "./../../../src/errors/http.error";
import UserModel from "../../../src/mongo/user.mongo";
import { IUser } from "./../../../src/interface/users.interface";
import AuthService from "../../../src/services/auth.service";
import { User } from "../../../src/models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import LogService from "../../../src/services/log.service";

describe("AuthService", () => {
    let authService: AuthService;
    let logService: LogService;
    const testUser: IUser = {
        _id: "507f1f77bcf86cd799439011",
        email: "test@email.com",
        password: "password",
        active: true,
    };

    describe("login", () => {
        beforeEach(() => {
            authService = new AuthService();
            logService = authService.logService;
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should throw error when cannot found user's email", async () => {
            const user = new User("notfound@email.com", "password");

            UserModel.findOne = jest.fn().mockResolvedValue(null);

            await expect(authService.login(user)).rejects.toThrow(
                new HttpError(
                    400,
                    `Your email '${user.email}' is not registered`
                )
            );
            expect(UserModel.findOne).toBeCalledTimes(1);
        });

        it("should throw error when user is not active", async () => {
            const lockedUser = { ...testUser, active: false };
            const user = new User(lockedUser.email, lockedUser.password);

            UserModel.findOne = jest.fn().mockResolvedValue(lockedUser);

            await expect(authService.login(user)).rejects.toThrow(
                new HttpError(400, `Your account '${user.email}' is locked`)
            );
            expect(UserModel.findOne).toBeCalledTimes(1);
        });

        it("should throw error when password is not matched", async () => {
            const user = new User(testUser.email, "wrongpassword");

            UserModel.findOne = jest.fn().mockResolvedValue(testUser);
            bcrypt.compare = jest.fn().mockResolvedValue(false);
            logService.writeLog = jest.fn().mockResolvedValue(null);
            authService["shouldLockAccount"] = jest
                .fn()
                .mockResolvedValue(false);

            await expect(authService.login(user)).rejects.toThrow(
                new HttpError(
                    400,
                    `Your provided password is not matched. Your account will be locked after 3 consecutive fail attempts`
                )
            );
            expect(UserModel.findOne).toBeCalledTimes(1);
            expect(bcrypt.compare).toBeCalledTimes(1);
            expect(logService.writeLog).toBeCalledTimes(1);
            expect(authService["shouldLockAccount"]).toBeCalledTimes(1);
        });

        it("should return token when provided password is matched", async () => {
            const user = new User(testUser.email, testUser.password);

            UserModel.findOne = jest.fn().mockResolvedValue(testUser);
            bcrypt.compare = jest.fn().mockResolvedValue(true);

            await expect(authService.login(user)).resolves.toEqual(
                authService["generateToken"](testUser)
            );
            expect(UserModel.findOne).toBeCalledTimes(1);
            expect(bcrypt.compare).toBeCalledTimes(1);
        });
    });

    describe("generateToken", () => {
        beforeEach(() => {
            authService = new AuthService();
            logService = authService.logService;
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should generate token using provided user's info", () => {
            const spy = jest.spyOn(jwt, "sign");

            const token = authService["generateToken"](testUser);

            expect(token).toBeDefined();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe("shouldLockAccount", () => {
        beforeEach(() => {
            authService = new AuthService();
            logService = authService.logService;
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should return false if there are less than 3 logs", async () => {
            logService.getLogs = jest.fn().mockResolvedValue([
                {
                    _id: "5e8f8f8f8f8f8f8f8f8f8f8f",
                    email: "test@email.com",
                    status: "success",
                    timestamp: 1597490990000,
                },
            ]);

            const result = await authService["shouldLockAccount"](testUser);

            expect(result).toBe(false);
            expect(logService.getLogs).toHaveBeenCalledTimes(1);
        });
        it("should return false if there are not 3 consecutive fail attempts", async () => {
            logService.getLogs = jest.fn().mockResolvedValue([
                {
                    _id: "5e8e8e8e8e8e8e8e8e8e8e8e",
                    email: "test@email.com",
                    status: "fail",
                    timestamp: 1597491000000,
                },
                {
                    _id: "5e8f8f8f8f8f8f8f8f8f8f8f",
                    email: "test@email.com",
                    status: "success",
                    timestamp: 1597490990000,
                },
                {
                    _id: "5e8g8g8g8g8g8g8g8g8g8g8g",
                    email: "test@email.com",
                    status: "fail",
                    timestamp: 1597490980000,
                },
            ]);

            const result = await authService["shouldLockAccount"](testUser);

            expect(result).toBe(false);
            expect(logService.getLogs).toHaveBeenCalledTimes(1);
        });
        it("should return true if there are 3 consecutive fail attempts", async () => {
            logService.getLogs = jest.fn().mockResolvedValue([
                {
                    _id: "5e8e8e8e8e8e8e8e8e8e8e8e",
                    email: "test@email.com",
                    status: "fail",
                    timestamp: 1597491000000,
                },
                {
                    _id: "5e8f8f8f8f8f8f8f8f8f8f8f",
                    email: "test@email.com",
                    status: "fail",
                    timestamp: 1597490990000,
                },
                {
                    _id: "5e8g8g8g8g8g8g8g8g8g8g8g",
                    email: "test@email.com",
                    status: "fail",
                    timestamp: 1597490980000,
                },
            ]);

            const result = await authService["shouldLockAccount"](testUser);

            expect(result).toBe(true);
            expect(logService.getLogs).toHaveBeenCalledTimes(1);
        });
    });
});
