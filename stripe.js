const express = require('express');
//const stripe = require('stripe')('sk_test_51PZwiQAIcs9UKTF7EPTKE9QUAGpdCbvsPLqkPF6jPGAkwNoC4xapSLI4BkUSqno1f2cK0B2iQelb4PdQQJFqPeXV00hT83F3kl');
const stripe = require('stripe')('sk_test_51PdfANJkWv19XhlOsxiroj2BXMeMud7xfol7zFvVAi8LV53eggnLLh32RP15XNMabdQdEs9j05RMaFdopM6gNbVW001lu5a5YV');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Endpoint to create connected account for business user
app.post('/create-connected-account', async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
    });

    res.send({
      accountId: account.id,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Endpoint to generate account link for onboarding
app.post('/onboard-user', async (req, res) => {
  const { accountId } = req.body;

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: 'http://localhost:3000/reauth',
      return_url: 'http://localhost:3000/return',
      type: 'account_onboarding',
    });

    res.send({
      url: accountLink.url,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Endpoint to create payment intent and transfer to connected account
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency, connectedAccountId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      transfer_data: {
        destination: connectedAccountId,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


app.post('/create-transfer', async (req, res) => {
  const { amount, currency, destination_account } = req.body;

  const transfer = await stripe.transfers.create({
    amount,
    currency,
    destination: destination_account, 
  });

  res.send(transfer);
});


app.listen(4242, () => console.log('Node server listening on port 4242!'));
