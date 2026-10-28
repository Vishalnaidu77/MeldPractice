import { Router } from "express";
import agent from "../agent/code.agent.js";

const agentRouter = Router()

agentRouter.post("/invoke", async (req, res) => {
    try {

        res.writeHead(200, {
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache',
            'connection': 'keep-alive'
        })

        const { message, projectId } = req.body;
        const response = await agent.stream({
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        }, {
            context: {
                projectId
            },
            streamMode: "custom"
        })

        for await (const chunk of response){
            console.log(chunk)
            res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        }
        res.status(200).json({ result: response.messages })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default agentRouter;