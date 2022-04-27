import { IUser } from "./../interface/users.interface";
import { HttpError } from "./../errors/http.error";
import { User } from "./../models/user.model";
import UserModel from "../mongo/user.mongo";
import { compare } from "bcrypt";
import { Document } from "mongoose";
import { sign } from "jsonwebtoken";
import LogService from "./log.service";

export const MAX_FAIL = 3;
export const LOCK_TIME = 1 * 60000;

class AuthService {
    public users = UserModel;
    public logService = new LogService();

    public async login(data: User): Promise<string> {
        const user = await this.users.findOne({
            email: data.email,
        });

        if (!user) {
            throw new HttpError(
                400,
                `Your email '${data.email}' is not registered`
            );
        }

        const isLocked = user.lockUntil && user.lockUntil > Date.now();
        if (isLocked) {
            throw new HttpError(
                400,
                `Your account '${
                    data.email
                }' is locked. Please try again in ${Math.ceil(
                    (user.lockUntil - Date.now()) / 60000
                )} minutes`
            );
        }

        const isPasswordMatched = await compare(data.password, user.password);
        if (!isPasswordMatched) {
            await this.logService.writeLog(user.email, "fail");
            const shouldLock = await this.shouldLockAccount(user);
            if (shouldLock) {
                user.lockUntil = Date.now() + LOCK_TIME;
                user.save();
            }
            throw new HttpError(
                400,
                `Your provided password is not matched. Your account will be locked after ${MAX_FAIL} consecutive fail attempts`
            );
        }

        return this.generateToken(user);
    }

    private generateToken(user: IUser): string {
        const secretKey = process.env.SECRET_KEY || "secret";
        const expiresIn = 60 * 60;

        return sign({ _id: user._id, email: user.email }, secretKey, {
            expiresIn,
        });
    }

    private async shouldLockAccount(user: IUser): Promise<boolean> {
        const logs = await this.logService.getLogs(
            user.email,
            Date.now() - LOCK_TIME
        );

        if (logs.length < MAX_FAIL) return false;

        let cnt = 0;
        logs.forEach((log) => {
            if (log.status == "fail") cnt++;
        });

        return cnt == MAX_FAIL;
    }
}

export default AuthService;
