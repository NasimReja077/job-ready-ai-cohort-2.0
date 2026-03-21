import "dotenv/config"
import readline from "readline/promises";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage } from "langchain"; // Added for type clarity

const rl = readline.createInterface({
     input: process.stdin,
     output: process.stdout,
});

const model = new ChatMistralAI({
     model: "mistral-small-latest",
})


/**
 * An LLM (Large Language Model) like Mistral actually has no short-term memory on its own. Every time you send a prompt, it forgets who you are immediately after answering. To have a "conversation," we store every message in this array and send the entire history back to the AI every single time.
 */

const messaages = []


console.log("\x1b[33m--- Chat Started (Type 'exit' to quit) ---\x1b[0m");

while (true){

     const userInput = await rl.question("\x1b[32mYou:\x1b[0m ");

     // 1. Track the human message

     messaages.push(new HumanMessage(userInput))
     // We take your text and wrap it in a HumanMessage object (which is a format LangChain understands). We then "push" it into our messages array so the AI knows this is the latest thing the human said.

     // 2. Get the AI response

     const response = await model.invoke(messaages)

     // 3. Track the AI response in history so it has context for the next turn

     messaages.push(response)

     console.log(`\x1b[34m[AI]\x1b[0m ${response.content}`)
}
r1.close()


/**
 * process.stdin: This tells Node.js to listen to your keyboard (Standard Input).
 * process.stdout: This tells Node.js to print the text back to your terminal screen (Standard Output).
 * rl: This is the object we use to actually ask questions.
 */