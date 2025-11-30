import type { IncomingMessage, ServerResponse } from "http";
import app from "./index";
import serverless from "serverless-http";

const handler = serverless(app);

export default function (req: IncomingMessage, res: ServerResponse) {
  return handler(req, res);
}
