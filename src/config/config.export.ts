import { ConfigApp, ConfigAuth, ConfigEmail } from "./config.schema";
import { validateEnv } from "./config.validate";

export const CONFIG_APP = validateEnv(ConfigApp);

export const CONFIG_AUTH = validateEnv(ConfigAuth);

export const CONFIG_EMAIL = validateEnv(ConfigEmail);