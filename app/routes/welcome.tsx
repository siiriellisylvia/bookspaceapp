import logo from "../assets/bookspace-beige.png";
import { Link, redirect } from "react-router";
import { Button } from "~/components/ui/button";
import books from "../assets/signup-image.png";
import { getAuthUserId } from "~/services/auth.server";
import type { Route } from "./+types/welcome";

export async function loader({ request }: Route.LoaderArgs) {
  const authUserId = await getAuthUserId(request);

  // If user is authenticated, redirect to home page
  if (authUserId) {
    return redirect("/home");
  }

  // If not authenticated, continue to show the welcome page
  return null;
}

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen h-screen px-4 relative">
      {/* Logo positioned absolutely to the left */}
      <div className="absolute left-4 top-8">
        <img src={logo} alt="Book Space logo" className="w-32" />
      </div>

      {/* Main content centered */}
      <div className="flex flex-col items-center justify-center gap-6 w-full mx-auto">
        <img src={books} alt="Books" className="w-full md:w-1/3" />
        <h1 className="text-center mb-2 text-primary-beige">
          Dive in with Book Space, where books meet connection
        </h1>
        <Button asChild className="mx-auto">
          <Link to="/signup">Create an account</Link>
        </Button>
        <p className="text-center">
          Already have an account?{" "}
          <Link to="/signin" className="font-bold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
