import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@surajng/common';

import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/orders';

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create a fake data event
    const data: OrderCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        ticket: {
            id: '123',
            price: 10
        },
        expiresAt: '2122',
        userId: new mongoose.Types.ObjectId().toHexString()
    };
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };

}

it('should replicate order info', async ()=> {
    const { listener, data, msg } = await setup();

    // call the onMessage function with data obj + message obj
    await listener.onMessage(data, msg);

    // assert to make sure a order was created
    const order = await Order.findById(data.id);
    
    expect(order).toBeDefined();
    expect(order!.price).toEqual(data.ticket.price);
    expect(order!.status).toEqual(data.status);
})

it('should acknowledge the message', async ()=> {
    const { listener, data, msg } = await setup();

    // call the onMessage function with data obj + message obj
    await listener.onMessage(data, msg);

    // assert to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();

})
