import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError, BadRequestError } from '@surajng/common';

import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', requireAuth, [
    body('title')
      .not()
      .isEmpty()
      .trim()
      .withMessage('title must be provided'),
    body('price')
      .trim()
      .isFloat({ gt : 0 })
      .withMessage('Price must be greater than 0')
  ], validateRequest, async (req: Request, res: Response) => {
    const  { title, price } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if(!ticket){
        throw new NotFoundError();
    }

    if(ticket.orderId){
      throw new BadRequestError('Ticket reserved by orderId. Cannot edit the ticket.');
    }
    if(ticket.userId !== req.currentUser!.id){
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price
    });

    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    });

    res.status(201).send(ticket);
})

export { router as updateTicketRouter };