[English](README.md) | [中文](README.zh-CN.md)

# o2lma

**o2lma** 是一个轻量级代理服务器，可将兼容 **DeepSeek** 或 **OpenAI**
格式的API请求转换为 **Ollama** API请求。这使得像 **VSCode Copilot Chat**
这样的工具能够通过Ollama方式调用第三方API。

## 功能特性

- **API兼容性**：将DeepSeek/OpenAI风格的请求转换为Ollama兼容格式
- **灵活配置**：支持通过命令行参数或环境变量自定义基础URL和API密钥
- **轻量级**：基于[Hono](https://hono.dev/)构建，开销极小
- **易于安装**：简单安装，快速启动

## 安装指南

1. 克隆仓库：
   ```bash
   git clone https://github.com/wrtx-dev/o2lma.git
   cd o2lma
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 构建项目：
   ```bash
   npm run build
   ```

## 配置说明

可通过命令行参数或环境变量配置服务器：

### 命令行选项：

```bash
npx o2lma --url [API基础URL] --apikey [API密钥] --host [主机] --port [端口] --cap [功能]
```

选项：

- `--url`: API基础URL（默认：https://api.deepseek.com）
- `--apikey`: 认证用的API密钥
- `--host`: 服务器主机（默认：localhost）
- `--port`: 服务器端口（默认：11434）
- `--cap`: 额外功能（可选：tools, thinking）

### 环境变量：

```bash
export BASE_URL="https://api.deepseek.com"
export API_KEY="你的API密钥"
```

## 使用方法

1. 启动服务器：
   ```bash
   npm start
   ```
   或开发模式：
   ```bash
   npm run dev
   ```

2. 服务器默认运行在 `http://localhost:11434`（可通过--host和--port参数配置）

3. 配置客户端（如VSCode Copilot）使用此本地端点

## API接口

服务器提供以下兼容Ollama API的接口：

- `GET /api/version` - 返回服务器版本
- `POST /api/show` - 返回模型能力
- `GET /api/tags` - 列出可用模型
- `POST /v1/chat/completions` - 代理聊天补全请求

## 开发指南

### 构建项目

```bash
npm run build
```

### 开发模式运行

```bash
npm run dev
```

### 贡献代码

欢迎提交Pull Request。重大改动请先创建Issue讨论。

## 开源协议

[MIT](https://choosealicense.com/licenses/mit/)
