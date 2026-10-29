const path = require("path");

process.env.NODE_ENV = "production";
process.env.PORT = "3050";
process.env.HOSTNAME = "127.0.0.1";

process.chdir(__dirname);

require(path.join(__dirname, ".next", "standalone", "server.js"));

const child = spawn(process.execPath, [nextCli, "start"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: process.env.PORT || "3050",
  },
});

child.on("exit", (code) => process.exit(code ?? 1));
