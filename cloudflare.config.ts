import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig(({ isPreview }) => ({
  accountId: "9d38d6df51b1822215655c1a96ba0626",
  worker: {
    name: "fibole",
    domains: isPreview ? [] : ["fibole.com"],
    compatibilityDate: "2026-06-19",
    compatibilityFlags: ["nodejs_compat"],
    entrypoint: "./worker/index.ts",
    observability: {
      enabled: true,
      logs: {
        enabled: true,
        headSamplingRate: 1,
      },
      traces: {
        enabled: true,
        headSamplingRate: 1,
      },
    },
    assets: {
      notFoundHandling: "single-page-application",
      runWorkerFirst: ["/api/*"],
    },
    triggers: isPreview
      ? []
      : [
          triggers.scheduled({
            schedule: "0 * * * *",
          }),
        ],
    env: {
      AI_GATEWAY_ID: bindings.text("fibole-questions"),
      DB: bindings.d1({
        name: "fibole-db",
        id: "5fc36128-3e05-4fec-aded-4d0217231297",
      }),
      AI: bindings.ai({}),
    },
  },
}));
