import "@/global.css";
import type { TransRenderProps } from "@lingui/react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { useLingui } from "@lingui/react/macro";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AppThemeProvider } from "@/shared/lib/app-theme-context";
import { initI18n } from "@/shared/i18n";
import { queryClient } from "@/shared/api/orpc";

// Catalogs are compiled into the bundle, so activation is synchronous and
// must happen before the first render.
initI18n();

// React Native requires strings to render inside <Text>; make that the
// default for every <Trans> in the app.
function DefaultTransComponent(props: TransRenderProps) {
  return <Text>{props.children}</Text>;
}

export const unstable_settings = {
  initialRouteName: "(drawer)",
};

function StackLayout() {
  const { t } = useLingui();

  return (
    <Stack screenOptions={{}}>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ title: t`Modal`, presentation: "modal" }} />
    </Stack>
  );
}

export default function Layout() {
  return (
    <I18nProvider i18n={i18n} defaultComponent={DefaultTransComponent}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <AppThemeProvider>
              <HeroUINativeProvider>
                <StackLayout />
              </HeroUINativeProvider>
            </AppThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </I18nProvider>
  );
}
