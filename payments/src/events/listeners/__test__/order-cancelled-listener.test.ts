import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderStatus, OrderCancelledEvent } from '@surajng/common';

import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/orders';

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // create and save a ticket
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: '1111',
        status: OrderStatus.Created,
        version: 0,
        price: 20
    });
    await order.save()
    
    // create a fake data event
    const data: OrderCancelledEvent["data"] = {
        version: 1,
        id: order.id,
        ticket: {
            id: '123'
        }
    };
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, order };

}

it('should update the status of the order', async ()=> {
    const { listener, data, msg, order } = await setup();

    // call the onMessage function with data obj + message obj
    await listener.onMessage(data, msg);

    // assert to make sure a order was cancelled
    const cancelledorder = await Order.findById(data.id);
    
    expect(cancelledorder).toBeDefined();
    expect(cancelledorder!.status).toEqual(OrderStatus.Cancelled);
})

it('should acknowledge the message', async ()=> {
    const { listener, data, msg, order } = await setup();

    // call the onMessage function with data obj + message obj
    await listener.onMessage(data, msg);

    // assert to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();

})

xit('should not acknowledge the message if version is in future', async ()=> {
    const { listener, data, msg, order } = await setup();

    data.version = 10;

    try{
        // call the onMessage function with data obj + message obj
        await listener.onMessage(data, msg);
    } catch(err){}
    // assert to make sure ack function is called
    expect(msg.ack).not.toHaveBeenCalled();

})