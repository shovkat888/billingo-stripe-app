import {
  Box,
  ContextView,
  Inline,
  TextField,
  Icon,
  Link,
  Button,
  Select,
  FormFieldGroup,
  DateField,
} from "@stripe/ui-extension-sdk/ui";
import {
  createHttpClient,
  STRIPE_API_KEY,
} from "@stripe/ui-extension-sdk/http_client";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";

import { useEffect, useState } from "react";
import { Logo } from "../images";
import axios from "axios";

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
  const [isConnected, setConnect] = useState(false);
  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [documentBlocks, setDocumentBlocks] = useState([]);

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

  const connect = async () => {
    if (apiKey === "") {
      return;
    }

    setConnect(true);
    getPartners();
    getProducts();
    getBankAccounts();
    getDocumentBlocks();
  };

  const getPartners = async () => {
    try {
      const res = await axios.post(
        `${environment.constants?.API_BASE}/partners`,
        {
          apiKey: apiKey,
        }
      );
      setPartners(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const getBankAccounts = async () => {
    try {
      const res = await axios.post(
        `${environment.constants?.API_BASE}/bank-accounts`,
        {
          apiKey: apiKey,
        }
      );
      setBankAccounts(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const getDocumentBlocks = async () => {
    try {
      const res = await axios.post(
        `${environment.constants?.API_BASE}/document-blocks`,
        {
          apiKey: apiKey,
        }
      );
      setDocumentBlocks(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const getProducts = async () => {
    try {
      const res = await axios.post(
        `${environment.constants?.API_BASE}/products`,
        {
          apiKey: apiKey,
        }
      );
      setProducts(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const invoiceView = (
    <>
      <Box css={{ marginY: "small", stack: "y", gapY: "medium" }}>
        <Select
          name="partner"
          label="Partner name"
          onChange={(e) => {
            console.log(e);
          }}
        >
          <option value="">Choose a Partner</option>
          {partners &&
            partners.map((partner: any, index: number) => {
              return (
                <option key={index} value={partner.id}>
                  {partner.name}
                </option>
              );
            })}
        </Select>

        <Select
          name="bank"
          label="Your bank account number"
          onChange={(e) => {
            console.log(e);
          }}
        >
          {bankAccounts &&
            bankAccounts.map((account: any, index: number) => {
              return (
                <option key={index} value={account.id}>
                  {account.name +
                    " : " +
                    account.account_number +
                    " (" +
                    account.currency +
                    ")"}
                </option>
              );
            })}
        </Select>

        <Select
          name="products"
          label="Product name"
          onChange={(e) => {
            console.log(e);
          }}
        >
          {products &&
            products.map((product: any, index: number) => {
              return (
                <option key={index} value={product.id}>
                  {product.name}
                </option>
              );
            })}
        </Select>

        <FormFieldGroup legend="Dates">
          <DateField label="Invoice date" />
          <DateField label="Date of completion" />
        </FormFieldGroup>

        <FormFieldGroup legend="Format">
          <Select
            name="accountblocks"
            label="Account block"
            onChange={(e) => {
              console.log(e);
            }}
          >
            {documentBlocks &&
              documentBlocks.map((block: any, index: number) => {
                return (
                  <option key={index} value={block.id}>
                    {block.name}
                  </option>
                );
              })}
          </Select>
        </FormFieldGroup>
      </Box>
    </>
  );

  const apiKeyView = (
    <>
      <Inline css={{ font: "body", fontFamily: "ui" }}>
        Enter your API Secret Key from Billingo. You’ll need a Payed
        Subscription to have one.
      </Inline>
      <Box css={{ marginY: "medium" }}>
        <TextField
          label="Key"
          placeholder="e5c2335a-470d-11ee-b3ab-12hf9760f844"
          onChange={(e) => {
            setAPIKey(e.target.value);
          }}
        />
      </Box>
      <Button
        type="primary"
        css={{ width: "fill", alignX: "center" }}
        onPress={() => connect()}
      >
        Connect
      </Button>
    </>
  );

  return (
    <ContextView
      title={isConnected === true ? "Invoices" : "Add Your API Key"}
      brandColor="#FF75BB"
      brandIcon={Logo}
    >
      <Box css={{ marginY: "xxsmall" }}>
        <Link href="https://dashboard.stripe.com/test/payments">
          <Inline css={{ fontWeight: "bold" }}>
            <Icon name="arrowLeft" /> Back
          </Inline>
        </Link>
      </Box>
      {isConnected === true ? invoiceView : apiKeyView}
    </ContextView>
  );
};

export default PaymentDetailView;
