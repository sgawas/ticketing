import mongoose from 'mongoose';

import { Order, OrderStatus } from '../models/orders';

// an interface that describes the properties 
// that are required to ticket new order
interface TicketAttrs{
    title: string;
    price: number;
}

// an interface that describes the properties
// that a Ticket Document has

export interface TicketDoc extends mongoose.Document{
    title: string;
    price: number;
    isReserved(): Promise<boolean>;
}

// an interface that describes the propeties
// that a Ticket model has
interface TicketModel extends mongoose.Model<TicketDoc>{
    build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc, ret){
            ret.id= ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
};

ticketSchema.methods.isReserved = async function() {
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
          $in: [
            OrderStatus.Created,
            OrderStatus.Complete,
            OrderStatus.AwaitingPayment
          ]
        }
    });
    return !!existingOrder;
}

const Ticket  = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };