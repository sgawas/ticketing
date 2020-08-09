import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

import { errorHandler, NotFoundError } from "@surajng/common";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    // disable encryption on cookie as JSON already encrypted
    signed: false,
    // always https connection if true. NODE_ENV is false for test this is required for tc execution since test it http connection instead of https.
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
