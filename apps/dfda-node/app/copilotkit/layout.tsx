import "@copilotkit/react-ui/styles.css";
import React, { ReactNode } from "react";
import { CopilotKit } from "@copilotkit/react-core";

// Where CopilotKit will proxy requests to. If you're using Copilot Cloud, this environment variable will be empty.
const runtimeUrl = process.env.NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL
// When using Copilot Cloud, all we need is the publicApiKey.
const publicApiKey = process.env.NEXT_PUBLIC_COPILOT_API_KEY;
// The name of the agent that we'll be using.
const agentName = process.env.NEXT_PUBLIC_COPILOTKIT_AGENT_NAME

/**
 * Wraps child components with the CopilotKit provider, configuring it using environment variables.
 *
 * Passes runtime URL, public API key, and agent name from environment variables to the CopilotKit context, enabling CopilotKit features for all nested components.
 *
 * @param children - React nodes to be rendered within the CopilotKit context
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <CopilotKit 
      runtimeUrl={runtimeUrl}
      publicApiKey={publicApiKey}
      agent={agentName}
    >
      {children}
    </CopilotKit>
  );
}
