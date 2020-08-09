import jwt from "jsonwebtoken";
import { Request } from "express";

// generate jwt and assigns it to req.session
export const jwtGenerate = (
  user: { email: string; id: string },
  req: Request
) => {
  //generate jwt
  const userJwt = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_KEY!
  );

  // store it on session object
  req.session = {
    jwt: userJwt,
  };
};
