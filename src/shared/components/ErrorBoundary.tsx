import { Component, type ReactNode, type ErrorInfo } from "react";
import { Container, Paper, Title, Text, Button, Stack, Group } from "@mantine/core";
import { IconAlertTriangle, IconRefresh, IconHome } from "@tabler/icons-react";
import { logger } from "../logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，记录错误并显示降级 UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    logger.error("ErrorBoundary caught an error", error.message, { componentStack: errorInfo.componentStack });
  }

  handleRefresh = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container size="sm" py="xl">
          <Paper p="xl" radius="md" withBorder>
            <Stack align="center" gap="lg">
              <IconAlertTriangle size={64} color="#fa5252" />
              
              <div style={{ textAlign: "center" }}>
                <Title order={2} c="red">
                  出错了
                </Title>
                <Text c="dimmed" mt="sm">
                  应用遇到了一个意外错误
                </Text>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <Paper p="md" radius="md" style={{ backgroundColor: "#fff5f5", width: "100%" }}>
                  <Text size="sm" style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", fontFamily: "monospace" }}>
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack && (
                      <>
                        {"\n\n"}
                        Component Stack:
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </Text>
                </Paper>
              )}

              <Group gap="md">
                <Button
                  variant="light"
                  leftSection={<IconRefresh size={16} />}
                  onClick={this.handleRefresh}
                >
                  刷新页面
                </Button>
                <Button
                  leftSection={<IconHome size={16} />}
                  onClick={this.handleGoHome}
                >
                  返回首页
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}