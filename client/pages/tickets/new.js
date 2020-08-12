import { useState } from "react";
import Router from "next/router";

import useRequest from "../../hooks/use-request";

const NewTicket = () => {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");

    const { doRequest, errors } = useRequest({
        url: "/api/tickets",
        method: "post",
        body: {
            title, price
        },
        // on success of ticket create user is directed to home page
        onSuccess: () => Router.push("/")
    });

    const onSubmit = (event) => {
        event.preventDefault();

        // calls the ticket service api
        doRequest();
    }
    // formats the price to 2 decimal
    const onBlur = () => {
        const value = parseFloat(price);
        if(isNaN(value)){
            return;
        }
        setPrice(value.toFixed(2));
    }

    return (
        <div>
            <h1>Create a ticket</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-control"/>
                </div>
                <div className="form-group">
                    <label>Price</label>
                    <input 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    onBlur={onBlur}
                    className="form-control"/>
                </div>
                {errors}
                <button className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
}

export default NewTicket;