import express from 'express';
import 'express-async-errors'
import { json } from 'body-parser';
import cookieSession from 'cookie-session'

import { errorHandler, NotFoundError, currentUser }  from '@surajng/common';
import { newOrderRouter } from './route/new';
import { showOrderRouter } from './route/show';
import { indexOrderRouter } from  './route/index';
import { deleteOrderRouter } from  './route/delete';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: false
}));
app.use(currentUser);

app.use(showOrderRouter);
app.use(newOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async (req, res)=>{
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };