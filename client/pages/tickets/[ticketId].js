import { Router } from "next/router";

import useRequest from "../../hooks/use-request";

const TicketShow = ({ ticket }) => {
    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id
        },
        // when user clicks on purchase user will be navigated to new order page
        // 1st parameter indicates which page user shld be navigated and 2nd indicates real id of the order
        onSuccess: (order) =>  Router.push('/orders/[orderId]', `/orders/${order.id}`)
    });
    return (
        <div>
            <h1>{ticket.title}</h1>
            <h4>Price: ${ticket.price}</h4>
            {errors}
            <button onClick={()=> doRequest()} className='btn btn-primary'>Purchase</button>
        </div>
    );
};

TicketShow.getInitialProps = async (context, client) => {
    const { ticketId } = context.query;

    const { data } = await client.get(`/api/tickets/${ticketId}`); 
    return { ticket:  data };
}
export default TicketShow;