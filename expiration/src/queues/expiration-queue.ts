import Queue from 'bull';

import { ExpirationCompletePublisher } from '../events/publisher/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';
// defines what information to be stored inside job
interface Payload{
    orderId: string;
}
// send the job to redis server to store into a bucket(order:exp) temporarily.
// after certain time elapsed, redis server will send 
// that job to expiration queue for processing to mark the order as expired
const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
        host: process.env.REDIS_HOST
    }
});
// process a job. publish an event to order service after certain delay
expirationQueue.process(async (job)=>{
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    });

});

export { expirationQueue };