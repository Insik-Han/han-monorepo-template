import { useLingui } from "@lingui/react/macro";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, Text } from "react-native";
import Animated, { FadeOut, ZoomIn } from "react-native-reanimated";

import { type AppLocale, LOCALES, setLocale } from "@/shared/i18n";

/**
 * Header button that cycles through the supported locales (en → ja → ko)
 * and persists the choice. Mirrors the ThemeToggle interaction.
 */
export function LocaleToggle() {
  const { i18n } = useLingui();

  const cycleLocale = () => {
    if (Platform.OS === "ios") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const index = LOCALES.findIndex((locale) => locale.value === i18n.locale);
    const next = LOCALES[(index + 1) % LOCALES.length] ?? LOCALES[0];
    setLocale(next.value);
  };

  return (
    <Pressable onPress={cycleLocale} className="px-2.5">
      <Animated.View key={i18n.locale} entering={ZoomIn} exiting={FadeOut}>
        <Text className="text-foreground text-xs font-semibold uppercase">
          {(i18n.locale as AppLocale) || "en"}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
