import { Form, Link, redirect } from "react-router";
import type { Route } from "../+types/root";
import User from "../models/User";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import logo from "../assets/logo-beige.svg";

export default function SignUp() {
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
        <Form id="sign-up-form" method="post" className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              name="name"
              aria-label="name"
              placeholder="Type your name..."
              required
            ></Input>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              aria-label="email"
              placeholder="Type your email..."
              required
            ></Input>
          </div>

          <div className="flex flex-col">
            <Label htmlFor="password">Password</Label>
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
    console.log(formData);
    const newUser = Object.fromEntries(formData);

    const result = await User.create(newUser);
    if (!result) {
      // Return a Response with error, or throw an error
      return { error: "User not created" };
    }

    return redirect("/");
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
}
