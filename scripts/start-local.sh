#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_ENV="$ROOT_DIR/apps/api/.env"
API_ENV_EXAMPLE="$ROOT_DIR/apps/api/.env.example"
API_PORT="${API_PORT:-${PORT:-4100}}"
WEB_PORT="${WEB_PORT:-5200}"

cd "$ROOT_DIR"

print_step() {
  printf "\n\033[1;36m%s\033[0m\n" "$1"
}

fail() {
  printf "\033[1;31m启动失败：%s\033[0m\n" "$1" >&2
  exit 1
}

is_port_in_use() {
  node -e "
    const net = require('node:net');
    const port = Number(process.argv[1]);
    const server = net.createServer();
    server.once('error', () => process.exit(0));
    server.once('listening', () => server.close(() => process.exit(1)));
    server.listen(port, '127.0.0.1');
  " "$1"
}

wait_and_print_ready() {
  local api_url="http://localhost:${API_PORT}/api/auth/me"
  local web_url="http://localhost:${WEB_PORT}"

  for _ in $(seq 1 90); do
    local api_ready=0
    local web_ready=0

    if curl -sS -o /dev/null "$api_url" >/dev/null 2>&1; then
      api_ready=1
    fi
    if curl -fsS "$web_url" >/dev/null 2>&1; then
      web_ready=1
    fi

    if [ "$api_ready" -eq 1 ] && [ "$web_ready" -eq 1 ]; then
      printf "\n\033[1;32m服务已启动\033[0m\n"
      printf "API: http://localhost:%s\n" "$API_PORT"
      printf "后台管理: \033[1;32mhttp://localhost:%s\033[0m\n" "$WEB_PORT"
      printf "按 Ctrl+C 停止服务。\n\n"
      return 0
    fi

    sleep 1
  done

  printf "\n\033[1;33m服务仍在启动中，请稍后访问：\033[0m\n"
  printf "API: http://localhost:%s\n" "$API_PORT"
  printf "后台管理: http://localhost:%s\n\n" "$WEB_PORT"
}

command -v node >/dev/null 2>&1 || fail "未找到 node，请先安装 Node.js >= 20"
command -v pnpm >/dev/null 2>&1 || fail "未找到 pnpm，请先安装 pnpm >= 10"

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "当前 Node.js 版本为 $(node -v)，项目要求 >= 20"
fi

if [ ! -f "$API_ENV" ]; then
  if [ -f "$API_ENV_EXAMPLE" ]; then
    fail "缺少 apps/api/.env。可先执行：cp apps/api/.env.example apps/api/.env，然后修改数据库和密钥配置"
  fi
  fail "缺少 apps/api/.env，请先创建后端环境配置"
fi

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  print_step "未发现 node_modules，开始安装依赖"
  pnpm install
fi

if is_port_in_use "$API_PORT"; then
  fail "API 端口 ${API_PORT} 已被占用。请停止占用进程，或使用 API_PORT=其他端口 pnpm start:local"
fi

if is_port_in_use "$WEB_PORT"; then
  fail "后台管理端口 ${WEB_PORT} 已被占用。请停止占用进程，或使用 WEB_PORT=其他端口 pnpm start:local"
fi

print_step "生成 Prisma Client"
pnpm --filter api prisma:generate

if [ "${RUN_MIGRATIONS:-0}" = "1" ]; then
  print_step "执行数据库迁移"
  pnpm --filter api prisma:migrate
else
  printf "跳过数据库迁移。如需启动前迁移，可运行：RUN_MIGRATIONS=1 pnpm start:local\n"
fi

print_step "启动 API 和后台管理"
printf "API: http://localhost:%s\n" "$API_PORT"
printf "后台管理: http://localhost:%s\n" "$WEB_PORT"
printf "登录后台请访问：\033[1;32mhttp://localhost:%s\033[0m\n" "$WEB_PORT"
printf "按 Ctrl+C 停止服务。\n\n"

export API_PORT
export WEB_PORT
export PORT="$API_PORT"

wait_and_print_ready &
READY_WATCHER_PID=$!

cleanup() {
  if kill -0 "$READY_WATCHER_PID" >/dev/null 2>&1; then
    kill "$READY_WATCHER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

pnpm dev
