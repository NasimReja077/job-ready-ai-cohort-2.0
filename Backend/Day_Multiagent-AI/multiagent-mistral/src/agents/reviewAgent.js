import { createAgent } from "langchain";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { reviewLLM } from "../llm.js";

const reviewAgent = createAgent({
  model: reviewLLM,
  tools: [],
  systemPrompt: `You are a specialist review and quality-assurance agent.
Your only job is to critically review content or code given to you.
Check for: accuracy, completeness, logical errors, hallucinations,
security issues (for code), and missing edge cases.
Be specific about what is wrong and what needs to change.
Do not write new content. Only review and give feedback.`,
});

export const reviewTool = tool(
  async ({ content }) => {
    const result = await reviewAgent.invoke({
      messages: [{ role: "user", content: content }],
    });
    const last = result.messages.at(-1);
    return last?.content ?? "";
  },
  {
    name: "review_agent",
    description:
      "Use this to review and validate any content or code for quality, accuracy, and correctness. Input: the content to review. Returns detailed feedback.",
    schema: z.object({
      content: z
        .string()
        .describe("The content or code to review and validate"),
    }),
  },
);
