import { createAgent } from "langchain";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { codeLLM } from "../llm.js";

const codeAgent = createAgent({
  model: codeLLM,
  tools: [], // code agent needs no external tools
  systemPrompt: `You are a specialist code writing agent. Your only job
is to write clean, working JavaScript/Node.js code based on
the specification given to you.
Write complete, runnable code with comments.
Do not do research. Do not review. Only write code.`,
});

export const codeTool = tool(
  async ({ specification }) => {
    const result = await codeAgent.invoke({
      messages: [{ role: "user", content: specification }],
    });
    const last = result.messages.at(-1);
    return last?.content ?? "";
  },
  {
    name: "code_agent",
    description:
      "Use this to write code. Input: a clear description of what the code should do. Returns working JavaScript/Node.js code.",
    schema: z.object({
      specification: z
        .string()
        .describe("A clear description of the code to write"),
    }),
  },
);
