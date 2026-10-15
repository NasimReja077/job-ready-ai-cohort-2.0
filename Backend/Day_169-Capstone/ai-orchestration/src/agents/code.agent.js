import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { ChatMistralAI } from "@langchain/mistralai"
import { listFiles, readFiles, updateFiles } from "./tools.js";
import { createAgent } from "langchain";

dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });

const MAX_RATE_LIMIT_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2_000;
const mistralApiKey = process.env.MISTRALAI_API_KEY?.trim();

const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: mistralApiKey,
    "temperature": 0.7,
    maxRetries: 0,
})

const agent = createAgent({
    model,
    tools: [ listFiles, readFiles, updateFiles ],
})

function getStatusCode(error) {
    return error?.statusCode ?? error?.response?.status;
}

function getRetryAfterMs(error) {
    const headers = error?.headers ?? error?.response?.headers;
    const value = typeof headers?.get === "function"
        ? headers.get("retry-after")
        : headers?.["retry-after"] ?? headers?.["Retry-After"];

    if (!value) {
        return undefined;
    }

    const seconds = Number(value);
    if (Number.isFinite(seconds)) {
        return Math.max(0, seconds * 1_000);
    }

    const retryAt = Date.parse(value);
    return Number.isNaN(retryAt) ? undefined : Math.max(0, retryAt - Date.now());
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

try {
    for (let retry = 0; ; retry += 1) {
        try {
            await agent.invoke({
                messages: [
                    {
                        role: "user",
                        content: "create a simple snake game in the project using react and css."
                    }
                ]
            });
            break;
        } catch (error) {
            if (getStatusCode(error) !== 429 || retry >= MAX_RATE_LIMIT_RETRIES) {
                throw error;
            }

            const delay = getRetryAfterMs(error) ?? INITIAL_RETRY_DELAY_MS * (2 ** retry);
            console.warn(`Mistral rate limit reached. Retrying in ${Math.ceil(delay / 1_000)} seconds (${retry + 1}/${MAX_RATE_LIMIT_RETRIES}).`);
            await wait(delay);
        }
    }
} catch (error) {
    if (getStatusCode(error) === 429 || error?.rateLimitType === "capacity") {
        console.error("Mistral remained rate-limited after automatic retries. Wait before running the agent again, or check your Mistral API capacity and plan.")
        if (error.body) {
            console.error("Mistral response:", error.body)
        }
        process.exitCode = 1
    } else if (getStatusCode(error) === 401) {
        console.error("Mistral rejected the API key. Check that MISTRALAI_API_KEY in src/agents/.env is a valid, active key from your Mistral account.")
        process.exitCode = 1
    } else {
        throw error
    }
}