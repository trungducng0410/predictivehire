import { IUser } from "./interface/users.interface";
import { User } from "./models/user.model";
import { Routes } from "./interface/routes.interface";
import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connect } from "mongoose";
import { hash } from "bcrypt";
import AuthController from "./controllers/auth.controller";
import errorMiddleware from "./middlewares/error.middleware";
import UserModel from "./mongo/user.mongo";
import LoginLogModel from "./mongo/log.mongo";

// Create Express server
class App {
    public app: express.Application;
    public port: number;
    public router: express.Router;
    public authController = new AuthController();

    constructor(routes: Routes[]) {
        // Get env config
        dotenv.config();
        const PORT = process.env.PORT || "3000";

        // Init app
        this.app = express();
        this.port = parseInt(PORT);
        this.router = express.Router();

        this.connectMongoDB();
        this.initMiddleware();
        this.initRoutes(routes);
        this.app.use(errorMiddleware);
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }

    public getServer() {
        return this.app;
    }

    private initMiddleware() {
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initRoutes(routes: Routes[]) {
        routes.forEach((route) => {
            this.app.use("/v1", route.router);
        });

        this.app.post("/v1/reset", function (_, res: express.Response) {
            App.createMockData();
            res.send({ message: "Reset data successfully" });
        });
    }

    private async connectMongoDB() {
        const DB_HOST = process.env.DB_HOST || "localhost";
        const DB_PORT = process.env.DB_PORT || "27017";
        const DB_NAME = process.env.DB_NAME || "predictivehire";

        try {
            connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`, {});
            await App.createMockData();
        } catch (error) {
            console.log("Fail to connect to mongodb");
        }
    }

    public static async createMockData(): Promise<IUser> {
        const users = UserModel;
        const logs = LoginLogModel;
        const TEST_EMAIL = "admin@predictivehire.com";
        const TEST_PASSWORD = "predictivehire";

        // Delete all data
        await users.deleteMany({ email: TEST_EMAIL });
        await logs.deleteMany({ email: TEST_EMAIL });

        // Create new data
        const data = new User(TEST_EMAIL, TEST_PASSWORD);
        const hashedPassword = await hash(TEST_PASSWORD, 10);
        const createdUserData: IUser = await users.create({
            ...data,
            password: hashedPassword,
        });

        return createdUserData;
    }
}

export default App;
