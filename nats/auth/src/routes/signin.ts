import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { validateRequest, BadRequestError } from '@surajng/common';
import { User } from '../models/user';
import { Password } from '../services/password';
import { jwtGenerate } from '../services/jwt-generate';

const router = express.Router();

router.post('/api/users/signin',
[
  body('email')
    .isEmail()
    .notEmpty()
    .withMessage('Email must be valid.'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password must be provided.')
],
validateRequest, 
async ( req: Request, res: Response ) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if(!existingUser){
    throw new BadRequestError('Invalid credentials.');
  }

  const passwordMatch = await Password.compare(existingUser.password, password);
  if(!passwordMatch){
    throw new BadRequestError('Invalid credentials.');
  }

  // generate jwt and assigns it to req.session
  jwtGenerate({email: existingUser.email, id: existingUser.id}, req);

  res.status(200).send({existingUser});
});

export { router as signinRouter };
