import request from 'supertest';

import { Ticket } from '../../models/ticket';
import { app } from '../../app';

import { natsWrapper } from '../../nats-wrapper';

it('should have route handler listening to /api/tickets for post requests', async ()=>{
    const response = await request(app)
        .post('/api/tickets')
        .send({});

        expect(response.status).not.toEqual(404);
});

it('should only be accessed if user is signed in', async ()=>{
    await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);
});

it('should not return 401 when user is signed in', async ()=>{
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({});
       // console.log(response.status);
        expect(response.status).not.toEqual(401);
});

it('should return an error if invalid title is provided', async ()=>{
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
            price: 10
        })
        .expect(400);
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            price: 10
        })
        .expect(400);
    
});

it('should return an error if invalid price is provided', async ()=>{
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'dasd',
            price: -10
        })
        .expect(400);
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'dasd'
        })
        .expect(400);
});

it('should create a ticket when valid inputs provided', async ()=>{

    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'dasd',
            price: 10
        })
        .expect(201);
    
    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    
    expect(tickets[0].price).toEqual(10);
    expect(tickets[0].title).toEqual('dasd');
});

it('should call mock function', async ()=>{

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'dasd',
            price: 10
        })
        .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})