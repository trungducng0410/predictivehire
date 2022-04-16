import { ILoginLog } from "./../interface/log.interface";
import { LoginLog } from "./../models/log.model";
import LoginLogModel from "../mongo/log.mongo";

class LogService {
    public history = LoginLogModel;

    public async writeLog(email: string, status: string) {
        const data = new LoginLog(email, status);
        await this.history.create({ ...data });
    }

    public async getLogs(email: string, from: number): Promise<ILoginLog[]> {
        return await this.history.find(
            {
                email: email,
                timestamp: { $gt: from },
            },
            [],
            {
                limit: 3,
                sort: {
                    timestamp: -1,
                },
            }
        );
    }
}

export default LogService;
