import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { validateRequest, BadRequestError } from '@surajng/common';
import { User } from '../models/user';
import { jwtGenerate } from '../services/jwt-generate';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if(existingUser){
      throw new BadRequestError('Email already in use.');
    }

    const user = User.build({ email, password });
    await user.save()

    // generate jwt and assigns it to req.session
    jwtGenerate({email: user.email, id: user.id}, req);
    
    res.status(201).send({user});

  }
);

export { router as signupRouter };
