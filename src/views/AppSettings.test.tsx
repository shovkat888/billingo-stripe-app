import {render, getMockContextProps} from "@stripe/ui-extension-sdk/testing";
import {SettingsView} from "@stripe/ui-extension-sdk/ui";

import AppSettings from "./AppSettings";

describe("AppSettings", () => {
  it("renders SettingsView", () => {
    const {wrapper} = render(<AppSettings {...getMockContextProps()} />);

    expect(wrapper.find(SettingsView)).toContainText("save to reload this view");
  });
});
