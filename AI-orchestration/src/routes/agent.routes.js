import { Router } from "express";

const agentRouter = Router()

agentRouter.post("/invoke", async (req, res) => {
    try {
        const { message } = req.body;
        const res = await agent.invoke({
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        })
        res.status(200).json({ result: res.messages.at(-1).content })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default agentRouter;