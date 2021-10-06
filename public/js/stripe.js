import axios from 'axios';
import { showAlert } from './alerts';

var stripe = Stripe('pk_test_51JgSsjDpHds6POSJXwZxdvlXTJAjySqIhSaWU9PmMlryvYRhbIJq6NAoqrQ6FoDtXyI7vavwqf3bUJ2aUrz9vPC000oWDqlTSK');


export const bookTour = async tourId => {
    try{
        //1. Get Checkout Session from Api (// To perform a simple Get request with axios we simply pass the url) 
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`); 
        // console.log(session);
        
        //2. Create Checkout Form + charge Credit Card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

    } catch (err) {
        console.log(err);
        showAlert('error', err)
    };
};