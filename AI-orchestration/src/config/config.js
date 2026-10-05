import 'dotenv/config'

if(!process.env.OPENROUTER_API_KEY){
    throw new Error("OPENROUTER_API_KEY is not defined")
}

export const Config = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    SANDBOX_URL: process.env.SANDBOX_URL || "http://localhost:9000",
}