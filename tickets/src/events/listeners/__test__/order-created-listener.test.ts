import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderCreatedEvent, OrderStatus } from '@surajng/common'
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {

    // create an instance of listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = await Ticket.build({
        userId: 'suraj',
        price: 10,
        title: 'twenty one pilots'
    });
    await ticket.save();

    // create the fake data event
    const data : OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: 'suraj',
        version: 0,
        ticket: {
            id: ticket.id,
            price: ticket.price
        },
        expiresAt: 'expired'
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, data, msg };
};

it('should set the orderId of the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);
    // refetch ticket to get updated data
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('should acknowledge the message', async() => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});

it('should publish ticket updated event after ticket is reversed by an order', async ()=> {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    // @ts-ignore
    console.log(natsWrapper.client.publish.mock.calls[0])[1];

    // if we dont use ts-ignore then to ts to understand its mock fn do this
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
    expect(data.id).toEqual(ticketUpdatedData.orderId);
})