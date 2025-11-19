import { UserDocument } from "../models/User";

export function safeUser(user: UserDocument | null) {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    provider: user.provider,
    role: user.role,
    printSettings: user.printSettings,
  };
}
