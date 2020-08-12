import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current"

import { OrderStatus } from "@surajng/common"

// exporting OrderStatus so that it can be access by all other files from single source instaed of calling common and orders file order schema
export { OrderStatus };

// an interface that describes the properties 
// that are required to create new order
interface OrderAttrs{
    id: string;
    userId: string;
    status: OrderStatus;
    version: number;
    price: number;
}
// when we write OrderAttrs we must provide an id property

// an interface that describes the properties
// that a Order Document has
// mongoose.Document already has id proprty hence we dont mention in orderDoc
interface OrderDoc extends mongoose.Document{
    userId: string;
    status: OrderStatus;
    version: number;
    price: number;
}

// an interface that describes the propeties
// that a Order model has
interface OrderModel extends mongoose.Model<OrderDoc>{
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    price:{
        type: Number,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret){
            ret.id= ret._id;
            delete ret._id;
        }
    }
});
orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

// when we build order we need to pass _id = attrs.id as per mongoose id req
orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        price: attrs.price,
        status: attrs.status,
        userId: attrs.userId,
        version: attrs.version
    });
};

const Order  = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };