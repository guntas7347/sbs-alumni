const { spawn } = require("child_process");

const nextCli = require.resolve("next/dist/bin/next");

process.env.NODE_ENV = "production";
process.env.PORT = "3050";
process.env.HOSTNAME = "127.0.0.1";

require("./.next/standalone/server.js");

const child = spawn(process.execPath, [nextCli, "start"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: process.env.PORT || "3050",
  },
});

child.on("exit", (code) => process.exit(code ?? 1));
