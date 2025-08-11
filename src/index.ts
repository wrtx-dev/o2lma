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
  console.log(await c.req.text());
  const body = await c.req.json();
  let capabilities = ["completion", "tools"];
  if (body.model === "deepseek-reasoner") {
    capabilities = [...capabilities, "thinking"];
  }
  return c.json({
    model_info: { "general.architecture": "qwen2" },
    capabilities: capabilities,
  });
});

app.get("/api/tags", async (c) => {
  const url = baseurl?.includes("api.siliconflow.cn")
    ? `https://api.siliconflow.cn/v1/models`
    : `${baseurl}/models`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apikey}`,
      "Content-Type": "application/json",
    },
  });
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
  return c.text("internal error", 500);
});

app.post("/v1/chat/completions", async (c) => {
  const res = await proxy(
    `${baseurl}/v1/chat/completions`,
    {
      ...c.req,
      method: "POST",
      headers: {
        ...c.req.header(),
        "Authorization": `Bearer ${apikey}`,
      },
    },
  );
  return res;
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
  if (argv.url === undefined) {
    baseurl = process.env.BASE_URL
      ? process.env.BASE_URL
      : "https://api.deepseek.com";
  } else {
    baseurl = argv.url;
  }

  if (argv.apikey === undefined) {
    apikey = process.env.API_KEY ? process.env.API_KEY : undefined;
  } else {
    apikey = argv.apikey;
  }
  if (argv.cap !== undefined) {
    caps = [...caps, ...argv.cap];
  }
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
    port: 11434,
  }, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  });
}

main().catch((err) => {
  console.error("Server startup error:", err);
  process.exit(1);
});
