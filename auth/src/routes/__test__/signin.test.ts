import request from 'supertest';

import { app } from '../../app';

beforeEach( async ()=>{
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        });
})

it('should not signin when user is not registered', async ()=>{
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@email.com',
            password: 'password'
        })
        .expect(400);
});

it('should be able to signin when user is registered', async ()=>{
    
    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(200);
    
    expect(response.get('Set-Cookie')).toBeDefined();
});

it('should not be able to signin when incorrect password is passed', async ()=>{
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'pass'
        })
        .expect(400);
})

it('should not be able to signin when blank email is passed', async ()=>{
    await request(app)
        .post('/api/users/signin')
        .send({
            password: 'pass'
        })
        .expect(400);
})