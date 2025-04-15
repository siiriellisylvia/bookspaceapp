import { Form, Link, redirect, useActionData } from "react-router";
import type { Route } from "../+types/root";
import User from "../models/User";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import logo from "../assets/bookspace-beige.png";

export default function SignUp() {
  const actionData = useActionData<{
    errors?: { name?: string; email?: string; password?: string };
    error?: string;
  }>();

  return (
    <div
      id="sign-up-page"
      className="flex min-h-screen items-center justify-center px-4"
    >
      <div className="absolute left-4 top-8">
        <img src={logo} alt="Book Space logo" className="w-32" />
      </div>
      <div className="w-full max-w-md p-8">
        <h1 className="text-center mb-6">Sign up</h1>

        {actionData?.error && (
          <div className="bg-primary-destructive/20 text-white p-3 rounded-md mb-4">
            {actionData.error}
          </div>
        )}

        <Form id="sign-up-form" method="post" className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              name="name"
              aria-label="name"
              placeholder="Type your name..."
              aria-invalid={actionData?.errors?.name ? "true" : undefined}
            />
            {actionData?.errors?.name && (
              <p className="text-primary-destructive! text-xs">
                {actionData.errors.name}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              aria-label="email"
              placeholder="Type your email..."
              aria-invalid={actionData?.errors?.email ? "true" : undefined}
            />
            {actionData?.errors?.email && (
              <p className="text-primary-destructive! text-xs">
                {actionData.errors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              aria-label="password"
              placeholder="Type your password..."
              autoComplete="current-password"
              aria-invalid={actionData?.errors?.password ? "true" : undefined}
            />
            {actionData?.errors?.password && (
              <p className="text-primary-destructive! text-xs">
                {actionData.errors.password}
              </p>
            )}
          </div>

          <Button className="w-full cursor-pointer mt-4" type="submit">
            Sign up
          </Button>
        </Form>
        <p className="mt-4">
          Do you already have an account?{" "}
          <Link to="/signin" className="font-bold hover:text-primary-beige-80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();

    // Simple validation
    const errors: { name?: string; email?: string; password?: string } = {};

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    if (!name) errors.name = "Name is required";
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    // Return errors if any required fields are missing
    if (Object.keys(errors).length > 0) {
      return { errors };
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        errors: {
          email: "This email is already registered",
        },
      };
    }

    // Create new user with validated data
    const newUser = {
      name,
      email,
      password,
    };

    const result = await User.create(newUser);
    if (!result) {
      return { error: "Failed to create account. Please try again." };
    }

    return redirect("/signin");
  } catch (error) {
    console.error("Signup error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}
