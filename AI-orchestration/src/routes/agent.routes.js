import { Router } from "express";
import agent from "../agent/code.agent.js";

const agentRouter = Router()

agentRouter.post("/invoke", async (req, res) => {
    try {

        res.writeHead(200, {
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache',
            'connection': 'keep-alive',
            'x-accel-buffering': 'no'
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
            if (res.destroyed) break;
            console.log(chunk)
            res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        }
        if (!res.destroyed) {
            res.write('event: complete\ndata: [DONE]\n\n')
            res.end()
        }
    } catch (err) {
        if (res.headersSent) {
            res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`)
            res.end()
        } else {
            res.status(500).json({ error: err.message })
        }
    }
})

export default agentRouter;
