import { Form, redirect } from "react-router";
import type { Route } from "../+types/root";
import { sessionStorage } from "../services/session.server";
import User, { type UserType } from "../models/User";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const authUserId = session.get("authUserId");
  if (!authUserId) {
    throw redirect("/signin");
  }
  const user = await User.findById(authUserId).lean();
  return Response.json({ user });
}

export default function ProfilePage({
  loaderData,
}: {
  loaderData: { user: UserType };
}) {
  const { user } = loaderData;
  console.log(user);

  return (
    <main>
      <div>
        <h1>Profile</h1>
        <p>Welcome to your profile page {user.email}</p>
        <Form method="post">
          <button>Logout</button>
        </Form>
      </div>
    </main>
  );
}

export async function action({ request }: Route.ActionArgs) {
  // Get the session
  const session = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );
  // Destroy the session and redirect to the signin page
  return redirect("/signin", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
}
