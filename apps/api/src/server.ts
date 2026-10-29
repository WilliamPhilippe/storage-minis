import { readApiConfig } from "./config.js";
import { startLifecycle } from "./lifecycle.js";

startLifecycle(() => readApiConfig(process.env));
