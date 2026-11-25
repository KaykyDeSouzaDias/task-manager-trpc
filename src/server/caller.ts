import "server-only";
import { appRouter } from "./routers/_app";
import { createCallerFactory } from "./trpc";

/** Chama o router direto no servidor (sem HTTP) — usado no SSR das páginas. */
export const serverApi = createCallerFactory(appRouter)({});
