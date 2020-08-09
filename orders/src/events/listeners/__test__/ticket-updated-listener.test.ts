import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@surajng/common';

import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/tickets';

const setup = async () => {
    // create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    ticket.save()
    
    // create a fake data event
    const data: TicketUpdatedEvent['data'] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: 'bon jovi concert',
        price: 200,
        userId: new mongoose.Types.ObjectId().toHexString()
    };
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, ticket };

}

it('should find, update and save a ticket', async ()=> {
    const { listener, data, msg, ticket } = await setup();

    // call the onMessage function with data obj + message obj
    await listener.onMessage(data, msg);

    // assert to make sure a ticket was created
    const updatedticket = await Ticket.findById(data.id);
    
    expect(updatedticket).toBeDefined();
    expect(updatedticket!.price).toEqual(data.price);
    expect(updatedticket!.title).toEqual(data.title);
    expect(updatedticket!.version).toEqual(data.version);
})

it('should acknowledge the message', async ()=> {
    const { listener, data, msg, ticket } = await setup();

    // call the onMessage function with data obj + message obj
    await listener.onMessage(data, msg);

    // assert to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();

})

it('should not acknowledge the message if version is in future', async ()=> {
    const { listener, data, msg, ticket } = await setup();

    data.version = 10;

    try{
        // call the onMessage function with data obj + message obj
        await listener.onMessage(data, msg);
    } catch(err){}
    // assert to make sure ack function is called
    expect(msg.ack).not.toHaveBeenCalled();

})