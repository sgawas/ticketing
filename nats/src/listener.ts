import nats from "node-nats-streaming";
import { randomBytes } from "crypto";

import { TicketCreatedListener } from "./events/ticket-created-listener";

console.clear();
// randombytes to generate unique client ids every new connection.
const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
    url: "http://localhost:4222"
})

stan.on("connect", ()=>{
    console.log("listening to Nats");

    stan.on("close", ()=>{
        console.log("NATS connection closed");
        process.exit();
    })
    new TicketCreatedListener(stan).listen();
})
// watching interrupt or terminate singles of nats client. nats server doesnt send event to deing client.
process.on("SIGINT", ()=> stan.close());
process.on("SIGTERM", ()=> stan.close());