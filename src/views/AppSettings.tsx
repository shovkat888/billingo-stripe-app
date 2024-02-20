import { Box, SettingsView, TextField } from "@stripe/ui-extension-sdk/ui";
import { showToast } from "@stripe/ui-extension-sdk/utils";
import {
  createHttpClient,
  STRIPE_API_KEY,
} from "@stripe/ui-extension-sdk/http_client";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import { useEffect, useState } from "react";

import Stripe from "stripe";

const stripe = new Stripe(STRIPE_API_KEY, {
  httpClient: createHttpClient() as Stripe.HttpClient,
  apiVersion: "2023-08-16",
});

const AppSettings = ({ userContext, environment }: ExtensionContextValue) => {
  const [apiKey, setAPIKey] = useState<string | null>();

  useEffect(() => {
    stripe.apps.secrets
      .find({
        scope: { type: "user", user: userContext.id },
        name: "BILLINGO_API_KEY",
        expand: ["payload"],
      })
      .then((res) => setAPIKey(res.payload));

    stripe.apps.secrets
      .list({
        scope: { type: "user", user: userContext.id },
      })
      .then((resp) => console.log(resp.data));
  }, []);

  const saveSecret = async () => {
    if (apiKey === null || apiKey === "") {
      showToast("API Key empty", { type: "caution" });
      return;
    }

    const res = await stripe.apps.secrets.create({
      scope: { type: "user", user: userContext.id },
      name: "BILLINGO_API_KEY",
      payload: apiKey,
    });

    setAPIKey(res.payload);
    showToast("Changes saved", { type: "success" });
  };

  return (
    <SettingsView onSave={saveSecret}>
      <Box
        css={{
          background: "container",
          borderRadius: "medium",
          padding: "large",
        }}
      >
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
