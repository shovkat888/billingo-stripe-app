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
import { showToast } from "@stripe/ui-extension-sdk/utils";
import {
  createHttpClient,
  STRIPE_API_KEY,
} from "@stripe/ui-extension-sdk/http_client";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";

import { ChangeEvent, useEffect, useState } from "react";
import { Logo } from "../images";
import { currencies } from "../constants";
import axios from "axios";
import { IPartner, IProduct, IBankAccount, IDocumentBlock } from "../types";

import Stripe from "stripe";

const stripe = new Stripe(STRIPE_API_KEY, {
  httpClient: createHttpClient() as Stripe.HttpClient,
  apiVersion: "2023-08-16",
});

const PaymentDetailView = ({
  userContext,
  environment,
}: ExtensionContextValue) => {
  const paymentId = environment.objectContext?.id
    ? environment.objectContext?.id
    : "";
  const [apiKey, setAPIKey] = useState<string | null>(null);
  const [isConnected, setConnect] = useState(false);
  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [documentBlocks, setDocumentBlocks] = useState([]);
  const [rate, setRate] = useState(1);

  const [partnerId, setPartnerId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [bankId, setBankId] = useState("");
  const [productId, setProductId] = useState("");
  const [currency, setCurrency] = useState("HUF");
  const [dueDate, setDueDate] = useState("");
  const [fulFillmentDate, setFulFillmentDate] = useState("");

  useEffect(() => {
    const retrievePayments = async () => {
      try {
        if (paymentId === "") return;

        await stripe.paymentIntents.retrieve(paymentId);
      } catch (error) {
        console.log(error);
      }
    };

    retrievePayments();
  }, [paymentId]);

  useEffect(() => {
    stripe.apps.secrets
      .find({
        scope: { type: "user", user: userContext.id },
        name: "BILLINGO_API_KEY",
        expand: ["payload"],
      })
      .then((res) => {
        setAPIKey(res.payload);
        getPartners(res.payload);
        getBankAccounts(res.payload);
        getDocumentBlocks(res.payload);
        setConnect(true);
      });
  }, [apiKey, isConnected]);

  const connect = async () => {
    if (apiKey === null || apiKey === "") {
      showToast("API Key empty", { type: "caution" });
      return;
    }

    await stripe.apps.secrets.create({
      scope: { type: "user", user: userContext.id },
      name: "BILLINGO_API_KEY",
      payload: apiKey,
    });

    setConnect(true);
    getPartners(apiKey);
    getBankAccounts(apiKey);
    getDocumentBlocks(apiKey);
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
      setPartners(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const getBankAccounts = async (apiKey: null | string) => {
    try {
      if (apiKey === null) return;

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

  const getDocumentBlocks = async (apiKey: null | string) => {
    try {
      if (apiKey === null) return;

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

  const getExchangeRate = async (e: ChangeEvent<HTMLSelectElement>) => {
    try {
      const res = await axios.post(
        `${environment.constants?.API_BASE}/currencies`,
        {
          apiKey: apiKey,
          to: e.target.value,
        }
      );
      setRate(res.data.conversation_rate);
      setCurrency(e.target.value);
    } catch (e) {
      console.log(e);
    }
  };

  const handleChangeProduct = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const res = await axios.post(
        `${environment.constants?.API_BASE}/productsbyquery`,
        {
          apiKey: apiKey,
          query: e.target.value,
        }
      );

      setProducts(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const createInvoice = async () => {
    try {
      const res = await axios.post(
        `${environment.constants?.API_BASE}/documents`,
        {
          apiKey: apiKey,
          partnerId: partnerId,
          blockId: blockId,
          bankId: bankId,
          currency: currency,
          conversionRate: rate,
          productId: productId,
          dueDate: dueDate,
          fulFillmentDate: fulFillmentDate,
        }
      );
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
            setPartnerId(e.target.value);
          }}
        >
          <option value="">Choose a Partner</option>
          {partners &&
            partners.map((partner: IPartner, index: number) => {
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
            setBankId(e.target.value);
          }}
        >
          <option value="">Choose a Bank Account</option>
          {bankAccounts &&
            bankAccounts.map((account: IBankAccount, index: number) => {
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

        <FormFieldGroup layout="column" legend="Products">
          <TextField
            css={{ width: "fill" }}
            label="Product name"
            onChange={handleChangeProduct}
          />
          <Select
            name="products"
            onChange={(e) => {
              setProductId(e.target.value);
            }}
          >
            <option value="">Choose a Product</option>
            {products &&
              products.map((product: IProduct, index: number) => {
                return (
                  <option key={index} value={product.id}>
                    {product.name}
                  </option>
                );
              })}
          </Select>
        </FormFieldGroup>

        <FormFieldGroup legend="Dates">
          <DateField
            label="Invoice date"
            onChange={(e) => setDueDate(e.target.value)}
          />
          <DateField
            label="Date of completion"
            onChange={(e) => setFulFillmentDate(e.target.value)}
          />
        </FormFieldGroup>

        <FormFieldGroup layout="column" legend="Format">
          <Box>
            <Select
              name="accountblocks"
              label="Account block"
              onChange={(e) => {
                setBlockId(e.target.value);
              }}
            >
              {documentBlocks &&
                documentBlocks.map((block: IDocumentBlock, index: number) => {
                  return (
                    <option key={index} value={block.id}>
                      {block.name}
                    </option>
                  );
                })}
            </Select>
          </Box>
          <Box css={{ stack: "x", gapX: "small" }}>
            <Select
              name="currency"
              label="Currency"
              onChange={getExchangeRate}
              css={{ width: "1/2" }}
            >
              {currencies &&
                currencies.map((currency: string, index: number) => {
                  return (
                    <option key={index} value={currency}>
                      {currency}
                    </option>
                  );
                })}
            </Select>
            <TextField
              css={{ width: "1/2" }}
              label="Exchange rate"
              value={rate}
              readOnly
            />
          </Box>
        </FormFieldGroup>

        <Box css={{ stack: "x", gapX: "small" }}>
          <Button
            type="primary"
            css={{ width: "fill", alignX: "center" }}
            onPress={() => createInvoice()}
          >
            <Icon name="invoice" size="small" />
            Generate Invoice
          </Button>
          <Button
            css={{ width: "1/6", alignX: "center" }}
            onPress={() => connect()}
          >
            <Icon name="download" size="small" css={{ fill: "brand" }} />
          </Button>
        </Box>
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
      title={isConnected === true ? "Invoice" : "Add Your API Key"}
      brandColor="#FF75BB"
      brandIcon={Logo}
    >
      <Box css={{ marginY: "xxsmall" }}>
        <Link href="https://dashboard.stripe.com/payments">
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
