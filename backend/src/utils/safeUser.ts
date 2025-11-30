import { UserDocument } from "../models/user";
import { Types } from "mongoose";

export function safeUser(user: UserDocument | null) {
  if (!user) return undefined;

  // ⚡ cast _id correctement via unknown
  const _id =
    typeof user._id === "string"
      ? user._id
      : (user._id as unknown as Types.ObjectId).toString();

  return {
    _id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    provider: user.provider,
    role: user.role,
    printSettings: user.printSettings,
  };
}
