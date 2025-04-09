import { Form, redirect } from "react-router";
import type { Route } from "../+types/root";
import { sessionStorage } from "../services/session.server";
import { type UserType } from "../models/User";
import { getAuthUser } from "~/services/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  if (!user) {
    throw redirect("/signin");
  }

  return { user };
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
