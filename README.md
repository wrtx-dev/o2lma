[English](README.md) | [中文](README.zh-CN.md)

# o2lma

**o2lma** is a lightweight proxy server that transforms API requests compatible
with **DeepSeek** or **OpenAI** formats into **Ollama** API requests. This
enables tools like **VSCode Copilot Chat** to interact with third-party APIs
through Ollama.

## Features

- **API Compatibility**: Converts DeepSeek/OpenAI-style requests to
  Ollama-compatible requests.
- **Flexible Configuration**: Supports custom base URLs and API keys via
  command-line arguments or environment variables.
- **Lightweight**: Built with [Hono](https://hono.dev/) for minimal overhead.
- **Easy Setup**: Simple installation and quick start with npm.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/wrtx-dev/o2lma.git
   cd o2lma
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

Configure the server using either command-line arguments or environment
variables:

### Command-line options:

```bash
npx o2lma --url [API_BASE_URL] --apikey [API_KEY] --host [HOST] --port [PORT] --cap [CAPABILITIES]
```

Options:

- `--url`: Base API URL (default: https://api.deepseek.com)
- `--apikey`: API key for authentication
- `--host`: Server host (default: localhost)
- `--port`: Server port (default: 11434)
- `--cap`: Additional capabilities (options: tools, thinking)

### Environment variables:

```bash
export BASE_URL="https://api.deepseek.com"
export API_KEY="your-api-key"
```

## Usage

1. Start the server:
   ```bash
   npm start
   ```
   Or for development:
   ```bash
   npm run dev
   ```

2. The server will run on `http://localhost:11434` by default (configurable via
   --host and --port)

3. Configure your client (e.g., VSCode Copilot) to use this local endpoint

## API Endpoints

The server provides the following endpoints compatible with Ollama API:

- `GET /api/version` - Returns server version
- `POST /api/show` - Returns model capabilities
- `GET /api/tags` - Lists available models
- `POST /v1/chat/completions` - Proxies chat completion requests

## Development

### Building

```bash
npm run build
```

### Running in development mode

```bash
npm run dev
```

### Contributing

Pull requests are welcome. For major changes, please open an issue first to
discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
