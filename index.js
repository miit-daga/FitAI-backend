const express = require("express");
const fitnessRoutes = require("./routes/fitnessRoutes");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use("/fitness", fitnessRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
