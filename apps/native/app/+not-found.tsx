import { Trans, useLingui } from "@lingui/react/macro";
import { Link, Stack } from "expo-router";
import { Button, Surface } from "heroui-native";
import { Text, View } from "react-native";

import { Container } from "@/shared/ui/container";

export default function NotFoundScreen() {
  const { t } = useLingui();

  return (
    <>
      <Stack.Screen options={{ title: t`Not Found` }} />
      <Container>
        <View className="flex-1 justify-center items-center p-4">
          <Surface variant="secondary" className="items-center p-6 max-w-sm rounded-lg">
            <Text className="text-4xl mb-3">🤔</Text>
            <Text className="text-foreground font-medium text-lg mb-1">
              <Trans>Page Not Found</Trans>
            </Text>
            <Text className="text-muted text-sm text-center mb-4">
              <Trans>The page you're looking for doesn't exist.</Trans>
            </Text>
            <Link href="/" asChild>
              <Button size="sm">
                <Trans comment="Button that navigates back to the home screen">Go Home</Trans>
              </Button>
            </Link>
          </Surface>
        </View>
      </Container>
    </>
  );
}
