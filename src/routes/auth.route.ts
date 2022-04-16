import { Router } from "express";
import { Routes } from "../interface/routes.interface";
import AuthController from "../controllers/auth.controller";

class AuthRoute implements Routes {
    public path: string = "/";
    public router = Router();
    public authController = new AuthController();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(`${this.path}login`, this.authController.logIn);
    }
}

export default AuthRoute;
