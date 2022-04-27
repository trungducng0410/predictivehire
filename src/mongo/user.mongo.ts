import { IUser } from "./../interface/users.interface";
import { Schema, model } from "mongoose";

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lockUntil: { type: Number },
});

const UserModel = model<IUser>("User", userSchema);

export default UserModel;
