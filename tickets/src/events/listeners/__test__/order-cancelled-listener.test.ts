import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderCancelledEvent, OrderStatus } from '@surajng/common'
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {

    // create an instance of listener
    const listener = new OrderCancelledListener(natsWrapper.client);
    const orderId = mongoose.Types.ObjectId().toHexString();
    // create and save a ticket
    const ticket = await Ticket.build({
        userId: 'suraj',
        price: 10,
        title: 'twenty one pilots'
    });
    // since we declared when ticket is created it will not have orderid field hence adding it now
    ticket.set({ orderId });
    await ticket.save();

    // create the fake data event with order cancelled
    const data : OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }    
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, data, msg, orderId };
};

it('should set the orderId of the ticket to undefined', async () => {
    const { listener, ticket, data, msg, orderId } = await setup();

    await listener.onMessage(data, msg);
    // refetch ticket to get updated data
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
});

it('should acknowledge the message', async() => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});

it('should publish ticket updated event after order is cancelled ', async ()=> {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    // @ts-ignore
    console.log(natsWrapper.client.publish.mock.calls[0])[1];

    // // if we dont use ts-ignore then to ts to understand its mock fn do this
    // const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
    // expect(data.id).toEqual(ticketUpdatedData.orderId);
})