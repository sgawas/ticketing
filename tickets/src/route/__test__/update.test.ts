import request from 'supertest';
import mongoose from  'mongoose';

import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('should return 404 if ticket is not found', async ()=> {
    const id = new mongoose.Types.ObjectId().toHexString();
    const resp = await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'concert',
            price: 20
        })
        .expect(404);
    
});

it('should return 401 if user is not authenticated', async ()=> {
    const id = new mongoose.Types.ObjectId().toHexString();
    const resp = await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'concert',
            price: 20
        })
        .expect(401);
});

it('should return 401 if user does not own the ticket', async ()=> {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'dasd',
            price: 10
        })
        .expect(201);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'concert',
            price: 20
        })
        .expect(401);
    
});

it('should return 400 if invalid price or title are provided', async ()=> {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'dasd',
            price: 10
        })
        .expect(201);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            price: 20
        })
        .expect(400);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'concert',
            price: -20
        })
        .expect(400);
});

it('should update the ticket if valid inputs provided', async ()=> {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'dasd',
            price: 10
        })
        .expect(201);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'concert',
            price: 20
        })
        .expect(201);
    
    const ticket = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send({})
        .expect(200);
    
    expect(ticket.body.title).toEqual('concert');
});

it('should call mock publish function', async ()=>{
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'dasd',
            price: 10
        })
        .expect(201);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'concert',
            price: 20
        })
        .expect(201);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})

it('should reject updates if the ticket is reserved', async ()=> {
    const cookie = global.signin();
    
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'dasd',
            price: 10
        })
        .expect(201);
    
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString()});
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'concert',
            price: 20
        })
        .expect(400);
});