import request from 'supertest';

import { app } from '../app';

export const authHelper = async ()=> {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        });
    return response.get('Set-Cookie');
}