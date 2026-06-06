import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";

// auth-client pulls `env/web` (validated at import) and talks to the
// network — neither belongs in a component test.
vi.mock("@/shared/api/auth-client", () => ({
  authClient: {
    useSession: () => ({ isPending: false }),
    signIn: { email: vi.fn() },
  },
}));

// useNavigate needs a live router; the form only calls it after a
// successful sign-in, so a stub is enough here.
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useNavigate: () => vi.fn(),
}));

const { default: SignInForm } = await import("./sign-in-form");

function renderSignInForm() {
  return render(
    <I18nProvider i18n={i18n}>
      <SignInForm onSwitchToSignUp={() => {}} />
    </I18nProvider>,
  );
}

describe("SignInForm", () => {
  it("renders the translated heading and fields", () => {
    renderSignInForm();

    expect(screen.getByRole("heading", { name: "Welcome Back" })).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });

  it("shows validation errors on invalid submit", async () => {
    const user = userEvent.setup();
    const { container } = renderSignInForm();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "short");
    // jsdom doesn't run native submit-button behavior, so submit the form directly.
    fireEvent.submit(container.querySelector("form")!);

    expect(await screen.findByText("Invalid email address")).toBeTruthy();
    expect(screen.getByText("Password must be at least 8 characters")).toBeTruthy();
  });
});
