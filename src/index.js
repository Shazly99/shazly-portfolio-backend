import app from "./app.js";
import { config } from "./config.js";
import "./db.js";

app.listen(config.port, () => {
  console.log(`Backend running at http://localhost:${config.port}`);
  console.log(`API map: http://localhost:${config.port}/api`);
});
