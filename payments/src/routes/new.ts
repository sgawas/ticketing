import express, {Request, Response} from "express";
import { body } from "express-validator";

import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError, OrderStatus, BadRequestError } from "@surajng/common";
import { Order } from "../models/orders";
import { stripe } from "../stripe";
import { Payment } from "../models/payments";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post("/api/payments", 
            requireAuth,
            [
                body("token")
                    .not()
                    .isEmpty()
                    .withMessage("Token can not be empty."),
                body("orderId")
                    .not()
                    .isEmpty()
                    .withMessage("OrderId can not be empty.")    
            ], 
            validateRequest,
            async (req: Request, res: Response)=> {
    
    const { token, orderId} = req.body;
    const order = await Order.findById(orderId);

    if(!order){
        throw new NotFoundError();
    };

    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError();
    };
    
    if(order.status === OrderStatus.Cancelled){
        throw new BadRequestError("Order is in cancelled state.");
    };

    const charge = await stripe.charges.create({
        amount: order.price * 100,
        currency: "usd",
        source: token
    });

    const payment = await Payment.build({
        orderId,
        stripeId: charge.id,
    });

    await payment.save();
    new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId
    });

    res.status(201).send({ id : payment.id });
});

export { router as createChargeRouter };