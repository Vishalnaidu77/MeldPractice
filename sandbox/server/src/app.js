import express from 'express';
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.get("/api/sandbox/health", (req, res) => {
    try {
        res.json({ message: "Sandbox server is healthy" });
    } catch (error) {
        console.error("Error in health check:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

export default app;
