import { createAgent } from "langchain";
import { primaryLLM } from "../llm.js";

// Import sub-agents — each is already wrapped as a tool() export
import { researchTool } from "./researchAgent.js";
import { codeTool } from "./codeAgent.js";
import { reviewTool } from "./reviewAgent.js";

// All sub-agents registered as tools on the orchestrator
const tools = [researchTool, codeTool, reviewTool];

// Orchestrator prompt — high-level planning, not execution
const primaryPrompt = `You are the primary orchestrator agent. You receive complex
tasks from the user and coordinate specialist sub-agents to complete them.

You have three tools:
- research_agent: use when you need facts, information, or data
- code_agent: use when you need to write or generate code
- review_agent: use when you need to verify, check, or validate content

Your job is to:
1. Break the task into subtasks
2. Delegate each subtask to the right specialist agent
3. Use the review_agent to verify important outputs
4. Assemble and return a complete, high-quality final answer

Always review code before returning it. Always verify facts when accuracy matters.`;

export const primaryAgent = createAgent({
  model: primaryLLM,
  tools,
  systemPrompt: primaryPrompt,
});
