import app from "./src/app.js";
import connectToDB from "./src/config/db.js";

const PORT = process.env.PORT || 8000;

connectToDB()
    .then(() => {
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    });