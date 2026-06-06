import { Button, Input, Label, TextField, toast } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import z from "zod";

import { authClient } from "@/shared/api/auth-client";

import Loader from "@/shared/ui/loader";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const { t } = useLingui();
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            void navigate({
              to: "/dashboard",
            });
            toast.success(t`Sign up successful`);
          },
          onError: (error) => {
            toast.danger(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, t`Name must be at least 2 characters`),
        email: z.email(t`Invalid email address`),
        password: z.string().min(8, t`Password must be at least 8 characters`),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">
        <Trans>Create Account</Trans>
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="name">
            {(field) => (
              <TextField className="space-y-2" name={field.name}>
                <Label htmlFor={field.name}>
                  <Trans>Name</Trans>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-danger text-sm">
                    {error?.message}
                  </p>
                ))}
              </TextField>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="email">
            {(field) => (
              <TextField className="space-y-2" name={field.name}>
                <Label htmlFor={field.name}>
                  <Trans>Email</Trans>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-danger text-sm">
                    {error?.message}
                  </p>
                ))}
              </TextField>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <TextField className="space-y-2" name={field.name}>
                <Label htmlFor={field.name}>
                  <Trans>Password</Trans>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-danger text-sm">
                    {error?.message}
                  </p>
                ))}
              </TextField>
            )}
          </form.Field>
        </div>

        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button type="submit" className="w-full" isDisabled={!canSubmit || isSubmitting}>
              {isSubmitting ? <Trans>Submitting...</Trans> : <Trans>Sign Up</Trans>}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <Button variant="ghost" onPress={onSwitchToSignIn} className="text-accent">
          <Trans>Already have an account? Sign In</Trans>
        </Button>
      </div>
    </div>
  );
}
