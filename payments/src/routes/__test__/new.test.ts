import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/orders';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payments';

jest.mock('../../stripe');

it('should throw 404 when order doesnt exist for payment processing', async ()=> {
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'anbc',
        orderId: mongoose.Types.ObjectId().toHexString()
    })
    .expect(404)
})

it('should throw 401 when user doing payment is different from order created user', async ()=> {
    const order = await Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(), 
        status: OrderStatus.Created, 
        version: 0, 
        price: 10
    })
    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'anbc',
        orderId: order.id
    })
    .expect(401);
})

it('should throw 400 when user trying to do payment for cancelled order', async ()=> {
    const userId = mongoose.Types.ObjectId().toHexString();
    
    const order = await Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId, 
        status: OrderStatus.Cancelled, 
        version: 0, 
        price: 10
    })

    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'anbc',
        orderId: order.id
    })
    .expect(400);
})

it('should return a 204 with valid inputs', async()=>{
    const order = await Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(), 
        status: OrderStatus.Created, 
        version: 0, 
        price: 10
    })
    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'tok_visa',
        orderId: order.id
    })
    .expect(201);
    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.currency).toEqual('usd');
    expect(chargeOptions.amount).toEqual(20 * 100);

    // const payment = await Payment.findOne({
    //     orderId: order.id,
    //     stripeId: stripecharge!.id
    // })
    // expect(payment).not.toBeNull()
});