import { ILoginLog } from "../interface/log.interface";
import { Schema, model } from "mongoose";

const loginLogSchema = new Schema<ILoginLog>({
    email: { type: String, required: true },
    status: { type: String, required: true },
    timestamp: { type: Number, required: true, default: Date.now() },
});

const LoginLogModel = model<ILoginLog>("LoginLog", loginLogSchema);

export default LoginLogModel;
