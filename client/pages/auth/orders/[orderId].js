import { useState, useEffect } from "react";
import StripeCheckout from 'react-stripe-checkout';
import Router from "next/router";

import useRequest from "../../../hooks/use-request";

const OrderShow = ({ order, currentUser })=> {
    const [ timeLeft, setTimeLeft ] = useState(0);
    
    const { doRequest, errors} = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: (payment)=> Router.push('/orders')
    })
    // when component renders this function runs only once 
    useEffect(()=> {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft/1000));
        };

        findTimeLeft();
        // calls every 1sec. no () for findTimeLeft
        const timerId = setInterval(findTimeLeft, 1000);
        
        // this will called if we navigate away from this page or stop showing this component
        return ()=> {
            clearInterval(timerId);
        };

    },[order]);
    
    if(timeLeft < 0){
        return(
            <div>
                Order expired.
            </div>
        );
    };

    return(
        <div>
            Time left to pay for order: {timeLeft} seconds
            <br/>
            <StripeCheckout 
                token={({id})=> doRequest({ token: id})}
                stripeKey="pk_test_51HAV3fIUBf2ghsPvxECjLksaLqPpnGOLVuXU2zXAkvDfa6ASdwkZgCsFcNBBXCadodhFTc6taLOPaNWsMGh8PvMJ00AfGL0Txv"
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors}
        </div>
    );
};

OrderShow.getInitialProps = (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`); 
    return { order:  data };
};

export default OrderShow;