import { User } from "./../../../src/models/user.model";
import { IUser } from "./../../../src/interface/users.interface";
import request from "supertest";
import mongoose from "mongoose";
import App from "../../../src/app";
import AuthRoute from "../../../src/routes/auth.route";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Testing Auth", () => {
    describe("[POST] /login", () => {
        it("should return error when email is invalid", async () => {
            const authRoute = new AuthRoute();
            const users = authRoute.authController.authService.users;
            mongoose.connect = jest.fn();
            const app = new App([authRoute]);

            const response = await request(app.getServer())
                .post("/v1/login")
                .send({ email: "invalid@", password: "password" });

            expect(response.status).toEqual(400);
            expect(response.body.error).toEqual("Invalid email");
        });

        it("should return error when email is not registered", async () => {
            const authRoute = new AuthRoute();
            const users = authRoute.authController.authService.users;
            mongoose.connect = jest.fn();
            const app = new App([authRoute]);
            users.findOne = jest.fn().mockResolvedValue(null);

            const response = await request(app.getServer())
                .post("/v1/login")
                .send({ email: "test@email.com", password: "password" });

            expect(response.status).toEqual(400);
            expect(response.body.error).toEqual(
                `Your email 'test@email.com' is not registered`
            );
        });

        it("should return jwt token when valid credential is provided", async () => {
            const userData = new User("test@email.com", "password");
            const authRoute = new AuthRoute();
            const users = authRoute.authController.authService.users;
            const logs = authRoute.authController.logService.history;
            mongoose.connect = jest.fn();
            const app = new App([authRoute]);
            users.findOne = jest.fn().mockReturnValue({
                _id: "507f1f77bcf86cd799439011",
                email: userData.email,
                password: await bcrypt.hash(userData.password, 10),
                active: true,
            });
            logs.create = jest.fn().mockResolvedValue(null);

            const response = await request(app.getServer())
                .post("/v1/login")
                .send({ email: "test@email.com", password: "password" });

            expect(response.status).toEqual(200);
            expect(response.body.token).toBeDefined();
        });
    });
});
