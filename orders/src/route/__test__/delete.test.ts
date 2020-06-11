import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Ticket } from '../../models/tickets';
import { Order, OrderStatus } from '../../models/orders';
import { natsWrapper } from '../../nats-wrapper';

const createTicket = async () => {
    const ticket = await Ticket.build({
        title: 'concert',
        price: 40
    });
    await ticket.save();
    return ticket;
};

it('should cancel order of a particular user', async ()=> {
    const ticket = await createTicket();
    const userOne = global.signin();
    
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ticketId: ticket.id})
        .expect(201);
    
    await request(app)
        .delete(`/api/orders/${orderOne.id}`)
        .set('Cookie', userOne)
        .send()
        .expect(204);
    
    const response = await request(app)
        .get(`/api/orders/${orderOne.id}`)
        .set('Cookie', userOne)
        .expect(200);
    expect(response.body.status).toEqual(OrderStatus.Cancelled);

})

it('should not cancel order of different user', async ()=> {
    const ticket = await createTicket();
    const userOne = global.signin();
    const userTwo = global.signin();
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ticketId: ticket.id})
        .expect(201);
    
    await request(app)
        .delete(`/api/orders/${orderOne.id}`)
        .set('Cookie', userTwo)
        .send()
        .expect(401);   
})

it('should return 404 if no orders found for that user', async ()=> {
    const userOne = global.signin();
    const orderOne = mongoose.Types.ObjectId();
    
    await request(app)
        .delete(`/api/orders/${orderOne}`)
        .set('Cookie', userOne)
        .send()
        .expect(404);
})

it('should emit an order created event', async()=> {
    const ticket = await createTicket();
    const userOne = global.signin();
    
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ticketId: ticket.id})
        .expect(201);
    
    await request(app)
        .delete(`/api/orders/${orderOne.id}`)
        .set('Cookie', userOne)
        .send()
        .expect(204);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});