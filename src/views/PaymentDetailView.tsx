import {
  Box,
  ContextView,
  Inline,
  TextField,
  Icon,
  Link,
  Button,
} from "@stripe/ui-extension-sdk/ui";
import {
  createHttpClient,
  STRIPE_API_KEY,
} from "@stripe/ui-extension-sdk/http_client";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";

import { useEffect, useState } from "react";
import { Logo } from "../images";

import Stripe from "stripe";

const stripe = new Stripe(STRIPE_API_KEY, {
  httpClient: createHttpClient(),
  apiVersion: "2023-08-16",
});

const PaymentDetailView = ({
  userContext,
  environment,
}: ExtensionContextValue) => {
  const paymentId = environment.objectContext?.id
    ? environment.objectContext?.id
    : "";
  const [apiKey, setAPIKey] = useState("");

  useEffect(() => {
    const retrievePayments = async () => {
      try {
        if (paymentId === "") return;

        const response = await stripe.paymentIntents.retrieve(paymentId);

        console.log(response);
      } catch (error) {
        console.log(error);
      }
    };

    retrievePayments();
  }, []);

  return (
    <ContextView title="Add Your API Key" brandColor="#FF75BB" brandIcon={Logo}>
      <Box css={{ marginY: "small" }}>
        <Link href="https://dashboard.stripe.com/test/payments">
          <Inline css={{ fontWeight: "bold" }}>
            <Icon name="arrowLeft" /> Back
          </Inline>
        </Link>
      </Box>
      <Inline css={{ font: "body", fontFamily: "ui" }}>
        Enter your API Secret Key from Billingo. You’ll need a Payed
        Subscription to have one.
      </Inline>
      <Box css={{ marginY: "medium" }}>
        <TextField
          label="Key"
          placeholder="dajfiafeifosa"
          onChange={(e) => {
            setAPIKey(e.target.value);
          }}
        />
      </Box>
      <Button type="primary" css={{ width: "fill", alignX: "center" }}>
        Connect
      </Button>
    </ContextView>
  );
};

export default PaymentDetailView;
