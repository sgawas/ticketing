import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Ticket } from '../../models/tickets';
import { Order, OrderStatus } from '../../models/orders';
import { natsWrapper } from '../../nats-wrapper';

it('should return an error if ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId})
        .expect(404);
});

it('should return an error if ticket is reserved', async () => {
    const ticket = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 40
    });
    await ticket.save();

    const order = await Order.build({
        status: OrderStatus.Created,
        userId: 'dasdjkasd',
        expiresAt: new Date(),
        ticket
    });
    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(400);
});

it('should create an order', async () => {
    const ticket = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 40
    });
    await ticket.save();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201);
    expect(response.body.ticket.title).toBe('concert');
    
})

it('should emit an order created event', async()=> {
    const ticket = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 40
    });
    await ticket.save();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});