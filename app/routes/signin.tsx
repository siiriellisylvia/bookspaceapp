import { Form, Link } from "react-router";
import { redirect } from "react-router";
import { authenticator } from "~/services/auth.server";
import type { Route } from "./+types/signin";
import { sessionStorage } from "~/services/session.server";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import logo from "../assets/logo-beige.svg";

export default function SignIn() {
  return (
    <div
      id="sign-in-page"
      className="flex flex-col min-h-screen items-center justify-center px-4"
    >
      <div className="absolute left-4 top-8">
        <img src={logo} alt="Book Space logo" className="w-32" />
      </div>
      <div className="w-full max-w-md p-8">
        <h1 className="text-center mb-6">Sign In</h1>
        <Form id="sign-in-form" method="post" className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              name="email"
              aria-label="email"
              placeholder="Type your email..."
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              name="password"
              aria-label="password"
              placeholder="Type your password..."
              autoComplete="current-password"
              required
            />
          </div>
          <Button className="w-full cursor-pointer" type="submit">
            Sign in
          </Button>

          <p className="mt-4">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-bold hover:text-primary-beige-80"
            >
              Sign up
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  try {
    // Authenticate user using the "user-pass" strategy
    const userId = await authenticator.authenticate("user-pass", request);

    // Get the current session
    const session = await sessionStorage.getSession(
      request.headers.get("cookie"),
    );

    // Store authenticated user ID in the session
    session.set("authUserId", userId);

    // Redirect to home page with updated session cookie
    return redirect("/", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  } catch (error) {
    console.error("Authentication error:", error);

    // Return a response with an error message instead of crashing
    return console.log("Invalid credentials");
  }
}
