import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model";
import AuthService from "../services/auth.service";
import LogService from "../services/log.service";

class AuthController {
    public authService = new AuthService();
    public logService = new LogService();

    public logIn = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = new User(req.body.email, req.body.password);
            const token = await this.authService.login(user);
            await this.logService.writeLog(user.email, "success");
            res.status(200).json({ token: token });
        } catch (error) {
            next(error);
        }
    };
}

export default AuthController;
