import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Ticket } from '../../models/tickets';
import { Order, OrderStatus } from '../../models/orders';

const createTicket = async () => {
    const ticket = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 40
    });
    await ticket.save();
    return ticket;
}

it('should fetch orders for particular user', async()=>{
    const ticketOne = await createTicket();
    const ticketTwo = await createTicket();
    const ticketThree = await createTicket();

    const userOne = global.signin();
    const userTwo = global.signin();

    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ticketId: ticketOne.id})
        .expect(201);
    const { body: orderTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ticketId: ticketTwo.id})
        .expect(201);
    const { body: orderThree } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ticketId: ticketThree.id})
        .expect(201);    

    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200);

    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderTwo.id);
    expect(response.body[1].id).toEqual(orderThree.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);
})