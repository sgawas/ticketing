import { Subjects, Publisher, OrderCancelledEvent } from '@surajng/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}