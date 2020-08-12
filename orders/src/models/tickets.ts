import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current"

import { Order, OrderStatus } from "../models/orders";

// an interface that describes the properties
// that are required to ticket new order
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

// an interface that describes the properties
// that a Ticket Document has

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
  version: number;
}

// an interface that describes the propeties
// that a Ticket model has
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {id: string, version: number}): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

// if you dont use above plugin to update version
// this function will run  when we try to save record to db
// it will try to find record with appropriate id but also with current version - 1
// ticketSchema.pre("save", function(done){
//   // @ts-ignore
//   this.$where = {
//     version: this.get("version") - 1,
//   }
//   done();
// });

ticketSchema.statics.findByEvent = (event: {id: string, version: number}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  })
};

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id, // mongoose always create _id field if no value provided, treats id field as different from _id
    title: attrs.title,
    price: attrs.price,
  });
};

ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this, // this == the ticket document that we just called isReserved on
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.Complete,
        OrderStatus.AwaitingPayment,
      ],
    },
  });
  // existingOrder can return either OrderDoc || null
  // if null then !null = true then !true = false
  // if OrderDoc then !OrderDoc = false then !false = true
  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
