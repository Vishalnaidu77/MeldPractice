import { createAgent } from 'langchain'
import { ChatOpenRouter } from '@langchain/openrouter'
import { listFiles, readFiles, updateFiles } from './tools.js'
import { Config } from '../config/config.js'

const model = new ChatOpenRouter({
    model: "minimax/minimax-m3.1-flash:free",
    apiKey: Config.OPENROUTER_API_KEY
})

const agent = new createAgent({
    model: model,
    tools: [ listFiles, readFiles, updateFiles],
    systemPrompt: `You are a code agent that can read and update files in a codebase.
    - Use list-files to list all files in the current directory.
    - Use read-files to read files in the current directory.
    - Use update-files to update files in the current directory.
    `,  
})

export default agent;