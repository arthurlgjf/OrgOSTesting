import { NavWrapper } from "./NavWrapper.client";

export async function NavBar() {
  // Mock user and actions for demo
  const user = null;
  const signUpUrl = "/signup";

  async function handleSignOut() {
    "use server";
    // No-op for demo
  }

  return (
    <NavWrapper
      user={user}
      signUpUrl={signUpUrl}
      signOutAction={handleSignOut}
    />
  );
}

