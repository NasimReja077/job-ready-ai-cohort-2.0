import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai"
import { listFiles, readFiles, updateFiles } from "./tools.js";
import { createAgent } from "langchain";

const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRALAI_API_KEY,
    "temperature": 0.7,
    maxRetries: 10,
})

const agent = createAgent({
    model,
    tools: [ listFiles, readFiles, updateFiles ],
})

try {
    await agent.invoke({
        messages: [
            {
                role: "user",
                content: "create a simple snake game in the project using react and css."
            }
        ]
    })
} catch (error) {
    if (error?.statusCode === 429 || error?.rateLimitType === "capacity") {
        console.error("Mistral is still rate-limited after retrying. Wait a little and run the agent again, or check your Mistral API capacity and plan.")
        if (error.body) {
            console.error("Mistral response:", error.body)
        }
        process.exitCode = 1
    } else {
        throw error
    }
}