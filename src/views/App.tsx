import {
  SignInView,
  Box,
  Inline,
  TextField,
  Button,
} from "@stripe/ui-extension-sdk/ui";
import { showToast } from "@stripe/ui-extension-sdk/utils";
import {
  createHttpClient,
  STRIPE_API_KEY,
} from "@stripe/ui-extension-sdk/http_client";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import { Logo } from "../images";

import { useEffect, useState } from "react";
import axios from "axios";

import Stripe from "stripe";

const stripe = new Stripe(STRIPE_API_KEY, {
  httpClient: createHttpClient() as Stripe.HttpClient,
  apiVersion: "2023-08-16",
});

const App = ({ userContext, environment }: ExtensionContextValue) => {
  const [apiKey, setAPIKey] = useState<string>("");
  const [disabled, setDisable] = useState(false);

  useEffect(() => {
    stripe.apps.secrets
      .find({
        scope: { type: "user", user: userContext.id },
        name: "BILLINGO_API_KEY",
        expand: ["payload"],
      })
      .then((res) => {
        setAPIKey(res.payload || "");
        setDisable(true);
      })
      .catch((e) => console.log(e));

    // stripe.apps.secrets
    //   .deleteWhere({
    //     scope: { type: "user", user: userContext.id },
    //     name: "BILLINGO_API_KEY",
    //   })
    //   .then((resp) => console.log(resp));
  }, [apiKey]);

  const connect = async () => {
    if (apiKey === null || apiKey === "") {
      showToast("API key is empty", { type: "caution" });
      return;
    }

    const isValid = await getPartners(apiKey);
    if (isValid) {
      await stripe.apps.secrets.create({
        scope: { type: "user", user: userContext.id },
        name: "BILLINGO_API_KEY",
        payload: apiKey,
      });

      setDisable(true);
    }
  };

  const getPartners = async (apiKey: null | string) => {
    try {
      if (apiKey === null) return;

      const res = await axios.post(
        `${environment.constants?.API_BASE}/partners`,
        {
          apiKey: apiKey,
        }
      );

      if (res) {
        showToast("The API key is valid.", { type: "success" });
        return true;
      }
    } catch (e) {
      showToast("The API key is invalid.", { type: "caution" });
      return false;
    }
  };

  const apiKeyView = (
    <>
      <Inline css={{ font: "body" }}>
        Please input your API Secret Key from Billingo. A Paid Subscription is
        required to obtain one.
      </Inline>
      <Box css={{ marginY: "small" }}>
        <TextField
          label="Key"
          placeholder="e5c2335a-470d-11ee-b3ab-12hf9760f844"
          defaultValue={apiKey}
          onChange={(e) => {
            setAPIKey(e.target.value);
          }}
          disabled={disabled}
        />
      </Box>
      <Button
        type="primary"
        css={{ width: "fill", alignX: "center" }}
        onPress={() => connect()}
        disabled={disabled}
      >
        Connect
      </Button>
    </>
  );

  return (
    <SignInView
      description={`To import data from Billingo to Stripe, kindly provide your API Key. Click "Add API Key" if you already have it. If you do not possess an API Key, please sign in or sign up to obtain one.`}
      descriptionActionLabel="Add API Key"
      descriptionActionTitle="Add API Key"
      descriptionActionContents={apiKeyView}
      primaryAction={{
        label: "Sign in to Billingo",
        href: "https://app.billingo.hu/auth/login",
      }}
      secondaryAction={{
        label: "Don`t have an account? Sign up",
        href: "https://app.billingo.hu/auth/registration",
      }}
      brandColor="#FF75BB"
      brandIcon={Logo}
    />
  );
};

export default App;
