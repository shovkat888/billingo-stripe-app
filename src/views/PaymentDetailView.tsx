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
  Spinner,
} from "@stripe/ui-extension-sdk/ui";
import { showToast } from "@stripe/ui-extension-sdk/utils";
import {
  createHttpClient,
  STRIPE_API_KEY,
} from "@stripe/ui-extension-sdk/http_client";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";

import { ChangeEvent, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Logo } from "../images";
// import { currencies } from "../constants";
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
  const [apiKey, setAPIKey] = useState<string | null>(null);
  const [isConnected, setConnect] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isGenerating, setGenerating] = useState(false);
  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [documentBlocks, setDocumentBlocks] = useState([]);
  // const [rate, setRate] = useState(1);

  const [partnerId, setPartnerId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [bankId, setBankId] = useState("");
  const [productId, setProductId] = useState("");
  // const [currency, setCurrency] = useState("HUF");
  const [dueDate, setDueDate] = useState("");
  const [fulFillmentDate, setFulFillmentDate] = useState("");

  const [isDisable, setDisable] = useState(true);

  useEffect(() => {
    stripe.apps.secrets
      .find({
        scope: { type: "user", user: userContext.id },
        name: "BILLINGO_API_KEY",
        expand: ["payload"],
      })
      .then((res) => {
        setAPIKey(res.payload);

        Promise.all([
          getPartners(res.payload),
          getBankAccounts(res.payload),
          getDocumentBlocks(res.payload),
        ]);
      });
  }, []);

  const getPartners = async (apiKey: null | string) => {
    try {
      if (apiKey === null) return;
      setLoading(true);

      const res = await axios.post(
        `${environment.constants?.API_BASE}/partners`,
        {
          apiKey: apiKey,
        }
      );
      setPartners(res.data);
      setLoading(false);
      setConnect(true);
    } catch (e) {
      showToast("Your API key is invalid", { type: "caution" });
      setLoading(false);
      setConnect(false);
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

  // const getExchangeRate = async (e: ChangeEvent<HTMLSelectElement>) => {
  //   try {
  //     const res = await axios.post(
  //       `${environment.constants?.API_BASE}/currencies`,
  //       {
  //         apiKey: apiKey,
  //         to: e.target.value,
  //       }
  //     );
  //     setRate(res.data.conversation_rate);
  //     setCurrency(e.target.value);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  const debounced = useDebouncedCallback(async (value) => {
    try {
      const res = await axios.post(
        `${environment.constants?.API_BASE}/productsbyquery`,
        {
          apiKey: apiKey,
          query: value,
        }
      );

      if (res.data.length === 0) {
        setDisable(true);
        showToast("Invalid product name", { type: "caution" });
        return;
      }
      setProducts(res.data);
      setDisable(false);
    } catch (e) {
      console.log(e);
    }
  }, 1000);

  const createInvoice = async () => {
    if (partnerId === "") {
      showToast("Please choose partner", { type: "caution" });
      return;
    }

    if (bankId === "") {
      showToast("Please choose bank", { type: "caution" });
      return;
    }

    if (blockId === "") {
      showToast("Please choose acount block", { type: "caution" });
      return;
    }

    if (productId === "") {
      showToast("Please choose product", { type: "caution" });
      return;
    }

    if (dueDate === "") {
      showToast("Please choose due date", { type: "caution" });
      return;
    }

    if (fulFillmentDate === "") {
      showToast("Please choose completion date", { type: "caution" });
      return;
    }

    setGenerating(true);
    try {
      const res = await axios.post(
        `${environment.constants?.API_BASE}/documents`,
        {
          apiKey: apiKey,
          partnerId: partnerId,
          blockId: blockId,
          bankId: bankId,
          // currency: currency,
          // conversionRate: rate,
          productId: productId,
          dueDate: dueDate,
          fulFillmentDate: fulFillmentDate,
        }
      );

      if (res.data) {
        setGenerating(false);
        showToast("Invoice created successfully", { type: "success" });
      }
    } catch (e) {
      setGenerating(false);
      showToast("Unexpected Error occurred", { type: "caution" });
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
            placeholder="Input product name for searching..."
            onChange={(e) => debounced(e.target.value)}
          />
          <Select
            name="products"
            onChange={(e) => {
              setProductId(e.target.value);
            }}
            disabled={isDisable}
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
            label="Due date"
            onChange={(e) => setDueDate(e.target.value)}
          />
          <DateField
            label="Completion date"
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
          {/* <Box css={{ stack: "x", gapX: "small" }}>
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
          </Box> */}
        </FormFieldGroup>

        {isGenerating === true && (
          <Box css={{ stack: "x", alignX: "center" }}>
            <Spinner size="large" />
          </Box>
        )}
        <Box css={{ stack: "x", gapX: "small" }}>
          <Button
            type="primary"
            disabled={isGenerating}
            css={{ width: "fill", alignX: "center" }}
            onPress={() => createInvoice()}
          >
            <Icon name="invoice" size="small" />
            Generate Invoice
          </Button>
        </Box>
      </Box>
    </>
  );

  const apiKeyView = (
    <>
      <Inline css={{ font: "body", fontFamily: "ui" }}>
        There is no Billingo API key now. You should add API key first.
      </Inline>
    </>
  );

  return (
    <ContextView
      title={isConnected === true ? "Invoice" : "Loading"}
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
      {isLoading === true ? (
        <Box css={{ stack: "x", alignX: "center" }}>
          <Spinner size="large" />
        </Box>
      ) : isConnected === true ? (
        invoiceView
      ) : (
        apiKeyView
      )}
    </ContextView>
  );
};

export default PaymentDetailView;
