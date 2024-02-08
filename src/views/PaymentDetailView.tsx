import {
  Box,
  ContextView,
  Inline,
  TextField,
  Icon,
  Link,
  Button,
} from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import { ICBillingo, ICStripe, Logo } from "../images";

const PaymentDetailView = ({
  userContext,
  environment,
}: ExtensionContextValue) => {
  return (
    <ContextView title="Add Your API Key" brandColor="#FF75BB" brandIcon={Logo}>
      <Box css={{ marginY: "small" }}>
        <Link>
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
            console.log(e.target.value);
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
