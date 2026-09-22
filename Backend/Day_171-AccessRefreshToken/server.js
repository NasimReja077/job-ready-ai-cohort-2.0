require("dotenv").config();

import { listen } from "./src/app.js";
import connectDB from "./src/config/db.js";

connectDB();

let port = process.env.PORT || 4000;

listen(port, () => {
  console.log(`server is running on port ${port}`);
});