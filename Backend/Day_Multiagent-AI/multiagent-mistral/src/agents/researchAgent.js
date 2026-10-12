import { createAgent } from "langchain"; // ← top-level langchain package
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { researchLLM } from "../llm.js";

// Research agent's own internal tool
const webSearchTool = tool(
  async ({ query }) => {
    // Replace with a real search API (Tavily, SerpAPI, Brave, etc.)
    return `Search results for "${query}": [simulated results here]`;
  },
  {
    name: "web_search",
    description: "Search the internet for current information on a topic",
    schema: z.object({
      query: z.string().describe("The search query to look up"),
    }),
  },
);

// createAgent — no ChatPromptTemplate, no AgentExecutor needed
const researchAgent = createAgent({
  model: researchLLM,
  tools: [webSearchTool],
  systemPrompt: `You are a specialist research agent. Your only job is to
gather accurate, relevant information on a given topic.
Use the web_search tool to find information.
Return a concise, factual summary. Do not write code.
Do not give opinions. Only report what you find.`,
});

// Wrap the agent as a tool for the primary orchestrator
export const researchTool = tool(
  async ({ topic }) => {
    const result = await researchAgent.invoke({
      messages: [{ role: "user", content: topic }],
    });
    // result.messages — grab the last message (the agent's final answer)
    const last = result.messages.at(-1);
    return last?.content ?? "";
  },
  {
    name: "research_agent",
    description:
      "Use this to research any topic. Returns a factual summary. Input: the topic or question to research.",
    schema: z.object({
      topic: z.string().describe("The topic or question to research"),
    }),
  },
);
