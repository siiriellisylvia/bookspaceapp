// Authentication service using Remix Auth
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { sessionStorage } from "./session.server";
import { redirect } from "react-router";

// Initialize the authenticator with a generic type for the session storage
export const authenticator = new Authenticator<string>();

async function verifyUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await User.findOne({ email }).select("+password"); // Fetch user with password field
  if (!user) throw new Error("No user found with this email.");

  // Use bcryptjs to compare password (async version)
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw new Error("Invalid password.");

  return user._id.toString(); // Return user ID as a string
}

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");

    // Validate email
    if (!email || typeof email !== "string" || !email.trim()) {
      throw new Error("Email is required.");
    }

    // Validate password
    if (!password || typeof password !== "string" || !password.trim()) {
      throw new Error("Password is required.");
    }

    return verifyUser({ email, password }); // Authenticate user
  }),
  "user-pass", // Unique name for this authentication strategy
);

// Only return user ID from session
export async function getAuthUserId(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );
  return session.get("authUserId") || null; // Return null if not logged in
}

// Fetch full user details only when needed
export async function getAuthUser(request: Request) {
  const authUserId = await getAuthUserId(request);
  if (!authUserId) return null;

  const user = await User.findById(authUserId).lean();
  return user || null;
}

// Authenticate route (only checks for valid `authUserId`)
export async function authenticateUser(request: Request) {
  const authUserId = await getAuthUserId(request);
  if (!authUserId) {
    throw redirect("/signin");
  }
  return authUserId; // Only return the ID
}

// Log out the user
export async function logoutUser(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  return redirect("/signin", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
