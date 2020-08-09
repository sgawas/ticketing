import express from 'express';
import 'express-async-errors'
import { json } from 'body-parser';
import cookieSession from 'cookie-session'

import { errorHandler, NotFoundError, currentUser }  from '@surajng/common';
import { createTicketRouter } from './route/new';
import { showTicketRouter } from './route/show';
import { indexTicketsRouter } from  './route/index';
import { updateTicketRouter } from  './route/update';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test'
}));
// to incoming req.session property to get jwt if not then call next
// if there then get req.currentUser after decoding jwt 
app.use(currentUser);

app.use(showTicketRouter);
app.use(createTicketRouter);
app.use(indexTicketsRouter);
app.use(updateTicketRouter);

app.all('*', async (req, res)=>{
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };