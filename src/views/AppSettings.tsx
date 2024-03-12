import {
  Box,
  Inline,
  SettingsView,
  TextField,
} from "@stripe/ui-extension-sdk/ui";
import { showToast } from "@stripe/ui-extension-sdk/utils";
import {
  createHttpClient,
  STRIPE_API_KEY,
} from "@stripe/ui-extension-sdk/http_client";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import { useEffect, useState } from "react";
import axios from "axios";

import Stripe from "stripe";

const stripe = new Stripe(STRIPE_API_KEY, {
  httpClient: createHttpClient() as Stripe.HttpClient,
  apiVersion: "2023-08-16",
});

const AppSettings = ({ userContext, environment }: ExtensionContextValue) => {
  const [apiKey, setAPIKey] = useState<any>();

  useEffect(() => {
    stripe.apps.secrets
      .find({
        scope: { type: "user", user: userContext.id },
        name: "BILLINGO_API_KEY",
        expand: ["payload"],
      })
      .then((res) => setAPIKey(res.payload));
  }, []);

  const saveSecret = async () => {
    if (apiKey === null || apiKey === "") {
      showToast("API Key empty", { type: "caution" });
      return;
    }

    const isValid = await getPartners(apiKey);
    if (isValid) {
      const res = await stripe.apps.secrets.create({
        scope: { type: "user", user: userContext.id },
        name: "BILLINGO_API_KEY",
        payload: apiKey,
      });
      setAPIKey(res.payload);

      showToast("Changes saved", { type: "success" });
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

  return (
    <SettingsView onSave={saveSecret}>
      <Box
        css={{
          background: "container",
          borderRadius: "medium",
          padding: "large",
          stack: "y",
          gapY: "medium",
        }}
      >
        <Inline>
          Please input your API Secret Key from Billingo. A Paid Subscription is
          required to obtain one.
        </Inline>
        <TextField
          label="API Key"
          onChange={(e) => setAPIKey(e.target.value)}
          placeholder="d4e9237b-739d-11ff-b3bg-23ac0028f368"
          value={apiKey !== null ? apiKey : ""}
        />
      </Box>
    </SettingsView>
  );
};

export default AppSettings;
