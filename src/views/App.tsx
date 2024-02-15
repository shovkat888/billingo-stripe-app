import { Box, Link, SignInView } from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import { Logo } from "../images";

const App = ({ userContext, environment }: ExtensionContextValue) => {
  return (
    <SignInView
      description="To import your data from Stripe to Billingo, you will need to connect your account to Stripe."
      descriptionActionLabel="View demo"
      descriptionActionTitle="View demo"
      descriptionActionContents={<Link href="">View demo</Link>}
      primaryAction={{
        label: "Sign in to Billingo",
        href: "https://app.billingo.hu/auth/login",
      }}
      footerContent={
        <Box css={{ stack: "x", alignX: "center" }}>
          Don`t have an account?{" "}
          <Link href="https://app.billingo.hu/auth/registration">Sign up</Link>
        </Box>
      }
      brandColor="#FF75BB"
      brandIcon={Logo}
    />
  );
};

export default App;
