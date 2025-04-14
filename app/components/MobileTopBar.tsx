import logo from "~/assets/logo-beige.svg";

export default function MobileTopBar() {
  return (
    <div className="fixed top-0 left-0 w-full h-14 py-2 px-4 bg-white dark:bg-primary-dark flex items-center z-10">
      <img src={logo} alt="logo" className="w-12 h-auto" />
    </div>
  );
}
