import { Message } from 'node-nats-streaming';

import { Listener, OrderCancelledEvent, Subjects } from '@surajng/common';

import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message){
        // find the ticket that which order is cancelled
        const ticket = await Ticket.findById(data.ticket.id);

        // if no ticket then throw err
        if(!ticket){
            throw new Error('Ticket not found');
        }
        // mark the ticket is not reserved by setting its orderId=null since order is cancelled
        ticket.set({ orderId: undefined });
        // save the ticket
        await ticket.save();
        // orderId gets assigned to the ticket and same updates needs tp be sent to ticket service for consistency
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        });
        
        // ack the message
        msg.ack();
    }

}