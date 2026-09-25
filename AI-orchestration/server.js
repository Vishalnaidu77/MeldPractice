import app from "./src/app.js";

const PORT = 8001;

app.listen(PORT, () => {
    console.log(`AI Orchestration server running on port ${PORT}`);
})