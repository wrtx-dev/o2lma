import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { proxy } from "hono/proxy";
import { config } from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

config();

const app = new Hono();
const defaultUrl = "https://api.deepseek.com";

let baseurl: string | undefined = defaultUrl;
let caps: string[] = [];
let apikey: string | undefined = undefined;
app.get("/api/version", (c) => {
  return c.json({
    version: "0.11.0",
  });
});

app.post("/api/show", async (c) => {
  const body = await c.req.json();
  let capabilities = ["completion", "tools", ...caps];
  if (body.model === "deepseek-reasoner") {
    capabilities = [...capabilities, "thinking"];
  }
  return c.json({
    model_info: { "general.architecture": "qwen2" },
    capabilities: [...new Set(capabilities)],
  });
});

app.get("/api/tags", async (c) => {
  const url = baseurl?.includes(defaultUrl)
    ? `${defaultUrl}/models`
    : `${baseurl}/v1/models`;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 30_000);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apikey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      let models: { name: string; model: string }[] = [];
      data.data.map((item: any) => {
        models.push({
          name: item.id,
          model: item.id,
        });
      });
      return c.json({ models: models });
    }
  } catch (e) {
    console.error("fetch models error:", e);
  }
  return c.text("internal error", 500);
});

app.post("/v1/chat/completions", async (c) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 60_000);
  try {
    const res = await proxy(`${baseurl}/v1/chat/completions`, {
      ...c.req,
      method: "POST",
      headers: {
        ...c.req.header(),
        "Authorization": `Bearer ${apikey}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res;
  } catch (e) {
    return c.text("internal error", 500);
  }
});

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .scriptName("o2lma")
    .usage("$0 [args]")
    .option("url", {
      type: "string",
      description: "API base URL",
    })
    .option("apikey", {
      type: "string",
      description: "api key",
    })
    .option("host", {
      type: "string",
      description: "server host",
    })
    .option("port", {
      type: "number",
      description: "server port",
    })
    .option("cap", {
      type: "array",
      array: true,
      string: true,
      description: "capabilities",
      choices: ["tools", "thinking"],
    })
    .help("h")
    .alias("h", "help")
    .parse();
  if (argv.url === undefined || argv.url.length === 0) {
    baseurl = process.env.BASE_URL
      ? process.env.BASE_URL
      : "https://api.deepseek.com";
  } else {
    baseurl = argv.url;
  }

  if (argv.apikey === undefined || argv.apikey.length === 0) {
    apikey = process.env.API_KEY ? process.env.API_KEY : undefined;
  } else {
    apikey = argv.apikey;
  }
  if (argv.cap !== undefined) {
    caps = [...caps, ...argv.cap];
  }
  const host = argv.host ? argv.host : "localhost";
  const port = argv.port ? argv.port : 11434;
  if (!baseurl || !apikey) {
    console.log(
      "Please set the apikey and baseurl either via the command line or in a .env file.",
    );
    process.exit(-1);
  }
  if (baseurl.endsWith("/")) {
    baseurl = baseurl.slice(0, -1);
  }
  serve({
    fetch: app.fetch,
    hostname: host,
    port: port,
  }, (info) => {
    console.log(`Server is running on http://${info.address}:${info.port}`);
  });
}

main().catch((err) => {
  console.error("Server startup error:", err);
  process.exit(1);
});
