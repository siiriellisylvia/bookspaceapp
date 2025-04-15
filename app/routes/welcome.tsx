import logo from "../assets/logo-beige.svg";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import books from "../assets/signup-image.png";

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
