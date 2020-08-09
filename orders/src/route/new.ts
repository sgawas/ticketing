import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@surajng/common';

import { Order } from '../models/orders';
import { Ticket } from '../models/tickets';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post('/api/orders', 
requireAuth,
[
  body('ticketId')
    .not()
    .isEmpty()
    .trim()
    .custom((input:string)=> mongoose.Types.ObjectId.isValid(input))
    .withMessage('ticketId must be provided')
],
validateRequest,
async (req: Request, res: Response)=> {
  const { ticketId } = req.body;
  // find the ticket in db, which user is trying to order
  const ticket = await Ticket.findById(ticketId);
  if(!ticket){
    throw new NotFoundError();
  }

  // check if ticket is reserved 
  // runs query to look all orders in db. find an order where ticket is
  // the ticket we found above and order status is not cancelled.
  // If found an order that means ticket is already reserved and should throw an error.
  const isReserved = await ticket.isReserved();
  if(isReserved){
    throw new BadRequestError('Ticket already reserved.');
  }

  // calculate time of expiration for the order 
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  // build order and save it to db
  const order = await Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket
  });

  await order.save();
  
  // publish an event to other services saying order is created
  new OrderCreatedPublisher(natsWrapper.client).publish({
    id: order.id,
    status: order.status,
    userId: order.userId,
    expiresAt: order.expiresAt.toISOString(), // returns utc timestamp
    ticket: {
      id: ticket.id,
      price: ticket.price
    },
    version: order.version
  })

  res.status(201).send(order);
})

export { router as newOrderRouter };