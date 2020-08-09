import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}
// only to add additional properties in future
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number; // this is not defined inside Document interface hence manually added to the interface so that typescript doesnt complain
    orderId?: string; // orderid is option. when ticket is created orderId will be null. hence marked as not required.
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        userId: {
            type: String,
            required: true
        },
        orderId: {
            type: String,
        }

    }, {
        toJSON: {
            transform(doc, ret){
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            }
        }
    }
);
// adding version to ticket obj. default field name is __v hence renamed to version
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };