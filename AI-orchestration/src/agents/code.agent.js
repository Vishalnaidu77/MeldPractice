import 'dotenv/config'
import { ChatMistralAI} from "@langchain/mistralai"
import { createAgent } from "langchain"
import { listFiles, readFiles, updateFiles } from "./tools.js"

const mistralModel = new ChatMistralAI({
    model: "mistral-small-latest",
    apiKey: process.env.MISTRAL_API_KEY
})

const codeAgent = createAgent({
    model: mistralModel,
    tools: [ listFiles, readFiles, updateFiles ],
    instructions: `
    You are a code agent that can read, write, and update files in a codebase.
    `,
})

await codeAgent.invoke({
    messages: [
        {
            role: "user",
            content: "Change the theme from white to beige."
        }
    ]
})