/**
 * 日志工具
 * 在开发环境输出详细日志，生产环境静默
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const isDev = import.meta.env.DEV;

function formatMessage(level: LogLevel, ...args: unknown[]): unknown[] {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  return [prefix, ...args];
}

export const logger: Logger = {
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...formatMessage("debug", ...args));
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...formatMessage("info", ...args));
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...formatMessage("warn", ...args));
    }
  },
  error: (...args: unknown[]) => {
    // 错误始终记录
    console.error(...formatMessage("error", ...args));
  },
};