import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/protected.tsx", [
    route("", "routes/home.tsx"),
    route("profile", "routes/profile.tsx"),
    route("books", "routes/books.tsx"),
    route("books/:id", "routes/bookdetail.tsx"),
    route("books/:id/bookmark", "routes/bookmark.tsx"),
  ]),
  route("signup", "routes/signup.tsx"),
  route("signin", "routes/signin.tsx"),
] satisfies RouteConfig;
