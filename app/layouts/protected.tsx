import { Outlet } from "react-router";
import Nav, { MobileNav } from "~/components/Nav";
import MobileTopBar from "~/components/MobileTopBar";

export default function ProtectedLayout() {
  return (
    <>
      <div className="hidden md:block">
        <Nav />
      </div>
      <div className="block md:hidden">
        <MobileTopBar />
        <MobileNav />
      </div>
      <Outlet />
    </>
  );
}
