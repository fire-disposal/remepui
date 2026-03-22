// 简化的 Logger 工具（不依赖 Pino，使用原生 console）
// 支持结构化日志输出和环境适配

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  timestamp: string;
  level: LogLevel;
  module?: string;
  message: string;
  data?: unknown;
}

class Logger {
  private isDev = import.meta.env.DEV;

  private formatContext(context: LogContext): string {
    const { timestamp, level, module, message } = context;
    const modulePart = module ? `[${module}]` : '';
    return `${timestamp} ${level.toUpperCase()} ${modulePart} ${message}`;
  }

  private log(level: LogLevel, message: string, data?: unknown, module?: string) {
    const context: LogContext = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
    };

    const formatted = this.formatContext(context);

    if (this.isDev) {
      // 开发环境详细输出
      const logFn = console[level] || console.log;
      if (data) {
        logFn(formatted, data);
      } else {
        logFn(formatted);
      }
    } else {
      // 生产环境 JSON 格式
      console.log(JSON.stringify(context));
    }
  }

  debug(message: string, data?: unknown, module?: string) {
    this.log('debug', message, data, module);
  }

  info(message: string, data?: unknown, module?: string) {
    this.log('info', message, data, module);
  }

  warn(message: string, data?: unknown, module?: string) {
    this.log('warn', message, data, module);
  }

  error(message: string, error?: unknown, module?: string) {
    let errorData = error;
    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    this.log('error', message, errorData, module);
  }
}

export const logger = new Logger();
