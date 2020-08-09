import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent, OrderStatus } from '@surajng/common';

import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/tickets';
import { Order } from '../../../models/orders';

const setup = async () => {
    // create an instance of the listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save()
    
    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'suraj',
        expiresAt: new Date(),
        ticket
    })

    await order.save();

    // create a fake data event
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    };
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, ticket, order };

}

it('should update status to cancelled', async ()=> {
    const { listener, data, msg, ticket, order } = await setup();

    // call the onMessage function with data obj + message obj
    await listener.onMessage(data, msg);

    // assert to make sure a ticket was created
    const updatedOrder = await Order.findById(data.orderId);
    
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('should acknowledge the message', async ()=> {
    const { listener, data, msg, ticket, order } = await setup();

    // call the onMessage function with data obj + message obj
    await listener.onMessage(data, msg);

    // assert to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();

})

it('should emit order cancelled event', async ()=> {
    const { listener, data, msg, ticket, order } = await setup();

    await listener.onMessage(data, msg);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);

})