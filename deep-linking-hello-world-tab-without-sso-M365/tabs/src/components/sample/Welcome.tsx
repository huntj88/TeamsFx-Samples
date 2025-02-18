import { ReactElement, useEffect, useState } from "react";
import { Button, Image, Alert } from "@fluentui/react-northstar";
import "./Welcome.css";
import { pages, app } from "@microsoft/teams-js";
import { constants } from "../../constants";
import { SampleTabs } from "./SampleTabs";

export function Welcome(props: { environment?: string }): ReactElement {
  const [context, setContext] = useState({} as app.Context);
  const { environment } = {
    environment: window.location.hostname === "localhost" ? "local" : "azure",
    ...props,
  };
  const appId = environment === "local" ? constants.TEAMS_APP_ID_LOCAL : constants.TEAMS_APP_ID_DEV;
  const friendlyEnvironmentName =
    {
      local: "local environment",
      azure: "Azure environment",
    }[environment] || "local environment";

  const friendlyStepsName: { [key: string]: string } = {
    tab1: "Tab 1",
    tab2: "Tab 2",
    tab3: "Tab 3",
  };
  const [shareURL, setShareURL] = useState("");
  const [selectedMenuItem, setSelectedMenuItem] = useState("tab1");

  useEffect(() => {
    if (!app.isInitialized()) {
      app.initialize();
    }
    app.getContext().then((context) => {
      setContext(context);
      console.log(context);
    }).catch((err) => {
      console.error("Error getting context -> ", err);
    });

  }, []);

  useEffect(() => {
    if (context && Object.keys(context).length > 0 && context.page.subPageId) {
      setSelectedMenuItem(context.page.subPageId);
    }

  }, [context])

  return (
    <div className="welcome page">
      <div className="narrow page-padding">
        <Image src="hello.png" />
        <h1 className="center">Congratulations!</h1>
        <p className="center">Your app is running in your {friendlyEnvironmentName}</p>
        <p className="center">The deeplinking uses <code>page.subPageId</code> property from the Teams SDK <code>context</code> object which can be used to maintain the app state
          when a user clicks on the deeplink.</p>
        <div className="main-section">
          <div className="deeplink-functions-container">
            <div id="generate-deeplink">
              <h2>1. Generate Share URL to any of the 3 Tabs</h2>
              <p>Generates a share URL which can be copied and shared anywhere.</p>
              <p>The below button uses <code>pages.shareDeepLink()</code> function to generate hub specific share URL that can be used as deeplink.</p>
              <p>Select any of the 3 tabs on the right side and click on "Generate Share URL" button.</p>
              <p>It will generate a deeplink which can be shared with anyone. Once a user clicks on the deeplink,
                they will be redirected to the app and to that specific tab for which the link is generated.</p>
              <Button primary content="Generate Share URL" onClick={() => {
                const labelName = friendlyStepsName[selectedMenuItem];
                // const baseUrl = `https://${window.location.hostname}:${window.location.port}/index.html#/tab?selectedTab=${selectedMenuItem}&label=${labelName}`;

                // const url = `https://teams.microsoft.com/l/entity/69e84217-e248-4c91-82a5-c8904443a009/${context ? context.entityId : "index"}?webUrl=${encodeURI(baseUrl)}&context=${encodeURI(`{"subEntityId": "${selectedMenuItem}"`)}}`;
                const url = `https://teams.microsoft.com/l/entity/${appId}/${context ? context.page.id : "index"}?context=${encodeURI(`{"subEntityId": "${selectedMenuItem}"`)}}`;

                setShareURL(url);
                // pages.shareDeepLink({ subPageId: selectedMenuItem, subPageLabel: labelName, subPageWebUrl: encodeURI(baseUrl) });
                pages.shareDeepLink({ subPageId: selectedMenuItem, subPageLabel: labelName });

              }} />
              {shareURL && (<Alert content={shareURL} dismissible dismissAction="Close" />)}
            </div>
          </div>
          <SampleTabs selectedTab={selectedMenuItem} onTabChange={(selectedTab: string) => {
            setSelectedMenuItem(selectedTab);
            setShareURL("");
          }} />
        </div>
      </div>
    </div>
  );
}
