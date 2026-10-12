import { ChatCohere } from '@langchain/cohere';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import { ChatMistralAI } from '@langchain/mistralai';
import 'dotenv/config';

function getApiKey(name) {
  const apiKey = process.env[name];

  if (!apiKey) {
    throw new Error(`${name} is missing. Add it to the .env file.`);
  }

  return apiKey;
}

export const primaryLLM = new ChatMistralAI({
  model: 'mistral-small-latest',
  temperature: 0.3,
  maxRetries: 2,
  apiKey: getApiKey('MISTRAL_API_KEY'),
});

export const researchLLM = new ChatGoogleGenerativeAI({
  model: 'gemini-3.8-flash',
  temperature: 0.3,
  maxRetries: 2,
  apiKey: getApiKey('GEMINI_API_KEY'),
});

export const codeLLM = new ChatGroq({
  model: 'llama-3.3-70b-versatile',
  temperature: 0.1,
  maxRetries: 2,
  apiKey: getApiKey('GROQ_API_KEY'),
});

export const reviewLLM = new ChatCohere({
  model: 'command-a-03-2025',
  temperature: 0.2,
  maxRetries: 2,
  apiKey: getApiKey('COHERE_API_KEY'),
});