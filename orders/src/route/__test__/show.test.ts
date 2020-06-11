import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Ticket } from '../../models/tickets';
import { Order, OrderStatus } from '../../models/orders';

const createTicket = async () => {
    const ticket = await Ticket.build({
        title: 'concert',
        price: 40
    });
    await ticket.save();
    return ticket;
};

it('should fetch order details for particular user', async ()=> {
    const ticket = await createTicket();
    const userOne = global.signin();
    
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ticketId: ticket.id})
        .expect(201);
    
    const response = await request(app)
        .get(`/api/orders/${orderOne.id}`)
        .set('Cookie', userOne)
        .send()
        .expect(200);
    expect(response.body.ticket.id).toEqual(ticket.id);
})

it('should not fetch order details of different user', async ()=> {
    const ticket = await createTicket();
    const userOne = global.signin();
    const userTwo = global.signin();
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ticketId: ticket.id})
        .expect(201);
    
    const response = await request(app)
        .get(`/api/orders/${orderOne.id}`)
        .set('Cookie', userTwo)
        .send()
        .expect(401);   
})

it('should return 404 if no orders found for that user', async ()=> {
    const ticket = await createTicket();
    const userOne = global.signin();
    const orderOne = mongoose.Types.ObjectId();
    
    const response = await request(app)
        .get(`/api/orders/${orderOne}`)
        .set('Cookie', userOne)
        .send()
        .expect(404);
})