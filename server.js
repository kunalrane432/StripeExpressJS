const express = require('express');
const stripe = require('stripe')('sk_test_51PdfANJkWv19XhlOsxiroj2BXMeMud7xfol7zFvVAi8LV53eggnLLh32RP15XNMabdQdEs9j05RMaFdopM6gNbVW001lu5a5YV'); 
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Endpoint to create a payment intent
app.post('/create-payment-intent', async (req, res) => {
    const { amount, currency, payment_method_types, destination } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method_types,
            transfer_data: {
                destination: destination,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Endpoint to transfer funds to connected account
app.post('/transfer', async (req, res) => {
    const { amount, currency, destination } = req.body;

    try {
        const transfer = await stripe.transfers.create({
            amount,
            currency,
            destination, // The connected account ID
        });

        res.send({
            transfer,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
