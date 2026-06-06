import { Ionicons } from "@expo/vector-icons";
import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { Card, Chip, useThemeColor } from "heroui-native";
import { Text, View, Pressable } from "react-native";

import { Container } from "@/shared/ui/container";
import { SignIn, SignUp } from "@/features/auth";
import { authClient } from "@/shared/api/auth-client";
import { queryClient, orpc } from "@/shared/api/orpc";

export default function Home() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  const privateData = useQuery(orpc.privateData.queryOptions());
  const isConnected = healthCheck?.data === "OK";
  const isLoading = healthCheck?.isLoading;
  const { data: session } = authClient.useSession();

  const mutedColor = useThemeColor("muted");
  const successColor = useThemeColor("success");
  const dangerColor = useThemeColor("danger");

  return (
    <Container className="p-6">
      <View className="py-4 mb-6">
        <Text className="text-4xl font-bold text-foreground mb-2">BETTER T STACK</Text>
      </View>

      {session?.user ? (
        <Card variant="secondary" className="mb-6 p-4">
          <Text className="text-foreground text-base mb-2">
            <Trans>
              Welcome, <Text className="font-medium">{session.user.name}</Text>
            </Trans>
          </Text>
          <Text className="text-muted text-sm mb-4">{session.user.email}</Text>
          <Pressable
            className="bg-danger py-3 px-4 rounded-lg self-start active:opacity-70"
            onPress={() => {
              void authClient.signOut();
              void queryClient.invalidateQueries();
            }}
          >
            <Text className="text-foreground font-medium">
              <Trans comment="Button that signs the user out">Sign Out</Trans>
            </Text>
          </Pressable>
        </Card>
      ) : null}

      <Card variant="secondary" className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <Card.Title>
            <Trans>System Status</Trans>
          </Card.Title>
          <Chip variant="secondary" color={isConnected ? "success" : "danger"} size="sm">
            <Chip.Label>
              {isConnected ? (
                <Trans comment="Status chip: backend API is reachable">LIVE</Trans>
              ) : (
                <Trans comment="Status chip: backend API is unreachable">OFFLINE</Trans>
              )}
            </Chip.Label>
          </Chip>
        </View>

        <Card className="p-4">
          <View className="flex-row items-center">
            <View
              className={`w-3 h-3 rounded-full mr-3 ${isConnected ? "bg-success" : "bg-muted"}`}
            />
            <View className="flex-1">
              <Text className="text-foreground font-medium mb-1">ORPC Backend</Text>
              <Card.Description>
                {isLoading ? (
                  <Trans>Checking connection...</Trans>
                ) : isConnected ? (
                  <Trans>Connected to API</Trans>
                ) : (
                  <Trans>API Disconnected</Trans>
                )}
              </Card.Description>
            </View>
            {isLoading && <Ionicons name="hourglass-outline" size={20} color={mutedColor} />}
            {!isLoading && isConnected && (
              <Ionicons name="checkmark-circle" size={20} color={successColor} />
            )}
            {!isLoading && !isConnected && (
              <Ionicons name="close-circle" size={20} color={dangerColor} />
            )}
          </View>
        </Card>
      </Card>

      <Card variant="secondary" className="mt-6 p-4">
        <Card.Title className="mb-3">
          <Trans>Private Data</Trans>
        </Card.Title>
        {privateData && <Card.Description>{privateData.data?.message}</Card.Description>}
      </Card>

      {!session?.user && (
        <>
          <SignIn />
          <SignUp />
        </>
      )}
    </Container>
  );
}
