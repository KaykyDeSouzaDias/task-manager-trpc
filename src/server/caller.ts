import "server-only";
import { appRouter } from "./routers/_app";
import { createCallerFactory } from "./trpc";

/** Calls the router directly on the server (no HTTP) — used for SSR in the pages. */
export const serverApi = createCallerFactory(appRouter)({});
