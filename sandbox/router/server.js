import app from "./src/app.js";

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Router service is running on port ${PORT}`);
});