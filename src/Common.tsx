import "azure-devops-ui/Core/override.css";
import "es6-promise/auto";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./Common.scss";

/**
 * Helper Function to embed ReactElement in iFrame default document
 */
/* istanbul ignore next */
export function showRootComponent(component: React.ReactElement<any>) {
    const container = document.getElementById("root");
    if (container) {
        const root = ReactDOM.createRoot(container);
        root.render(component);
    }
}
