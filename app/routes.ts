import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("signup", "routes/signup.tsx"),
  route("signin", "routes/signin.tsx"),
  route("profile", "routes/profile.tsx"),
  route("books", "routes/books.tsx"),
  route("books/:id", "routes/bookdetail.tsx"),
] satisfies RouteConfig;
