import express, { Request, Response } from 'express';

import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response)=> {
    // find all tickets that doesnt have any order associated
    const tickets = await Ticket.find({
        orderId: undefined
    });
    res.send(tickets);
})

export { router as indexTicketsRouter };