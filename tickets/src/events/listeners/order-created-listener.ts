import { Message } from 'node-nats-streaming';

import { Listener, OrderCreatedEvent, Subjects } from '@surajng/common';

import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message){
        // find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // if no ticket then throw err
        if(!ticket){
            throw new Error('Ticket not found');
        }
        // mark the ticket is reserved by setting its orderId
        ticket.set({orderId: data.id});
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