import { Modal, Text, Button, Stack } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useTokenExpiredStore } from '../store/tokenExpired';
import { useAuthStore } from '../store/auth';

/**
 * JWT 过期/格式变更提示弹窗
 * 
 * 当检测到 JWT 格式变更或 401 错误时显示
 * 提示用户重新登录
 */
export function TokenExpiredModal() {
  const { isOpen, title, message, hide } = useTokenExpiredStore();
  const logout = useAuthStore((state) => state.logout);

  const handleLogin = () => {
    hide();
    // 清除当前登录状态
    logout();
    // 导航到登录页（通过页面刷新或路由跳转）
    window.location.href = '/login';
  };

  return (
    <Modal
      opened={isOpen}
      onClose={() => {}} // 禁止关闭
      title={
        <Stack gap="xs" align="center" style={{ width: '100%' }}>
          <IconLock size={48} color="#fa5252" />
          <Text size="lg" fw={600}>{title}</Text>
        </Stack>
      }
      centered
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack gap="md" align="center">
        <Text c="dimmed" ta="center">
          {message}
        </Text>
        
        <Button 
          fullWidth 
          color="red" 
          onClick={handleLogin}
          leftSection={<IconLock size={16} />}
        >
          重新登录
        </Button>
      </Stack>
    </Modal>
  );
}
