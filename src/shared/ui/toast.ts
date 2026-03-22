import { notifications } from '@mantine/notifications';
import { logger } from '../logger';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  autoClose?: boolean;
}

/**
 * Toast 通知系统
 * 基于 Mantine Notifications
 */
export const toast = {
  success: (message: string, duration = 3000) => {
    logger.info(`Toast: ${message}`);
    notifications.show({
      title: 'Success',
      message,
      color: 'green',
      autoClose: duration,
    });
  },

  error: (message: string, duration = 5000) => {
    logger.error(`Toast Error: ${message}`);
    notifications.show({
      title: 'Error',
      message,
      color: 'red',
      autoClose: duration,
    });
  },

  info: (message: string, duration = 3000) => {
    logger.info(`Toast Info: ${message}`);
    notifications.show({
      title: 'Info',
      message,
      color: 'blue',
      autoClose: duration,
    });
  },

  warning: (message: string, duration = 4000) => {
    logger.warn(`Toast Warning: ${message}`);
    notifications.show({
      title: 'Warning',
      message,
      color: 'yellow',
      autoClose: duration,
    });
  },

  show: (options: ToastOptions) => {
    const { message, type = 'info', duration = 3000 } = options;
    const colorMap = {
      success: 'green',
      error: 'red',
      info: 'blue',
      warning: 'yellow',
    };

    notifications.show({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message,
      color: colorMap[type],
      autoClose: duration,
    });
  },

  clear: () => {
    notifications.clean();
  },
};
