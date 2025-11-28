var braintree = require("braintree");
require("dotenv").config();

let gateway = null;
if (
  process.env.BRAINTREE_MERCHANT_ID &&
  process.env.BRAINTREE_PUBLIC_KEY &&
  process.env.BRAINTREE_PRIVATE_KEY
) {
  gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
  });
} else {
  console.warn("Braintree credentials not set. Braintree routes will return 503 until configured.");
}

class brainTree {
  ganerateToken(req, res) {
    if (!gateway) {
      return res.status(503).json({ error: "Braintree not configured" });
    }

    gateway.clientToken.generate({}, (err, response) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.json(response);
    });
  }

  paymentProcess(req, res) {
    if (!gateway) {
      return res.status(503).json({ error: "Braintree not configured" });
    }

    let { amountTotal, paymentMethod } = req.body;
    gateway.transaction.sale(
      {
        amount: amountTotal,
        paymentMethodNonce: paymentMethod,
        options: {
          submitForSettlement: true,
        },
      },
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json(err);
        }

        if (result && result.success) {
          console.log("Transaction ID: " + result.transaction.id);
          return res.json(result);
        } else {
          console.error(result && result.message);
          return res.status(400).json({ error: result && result.message });
        }
      }
    );
  }
}

const brainTreeController = new brainTree();
module.exports = brainTreeController;
