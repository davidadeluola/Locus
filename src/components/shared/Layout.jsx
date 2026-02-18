
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="relative bg-[#F8F9FA] min-h-screen overflow-x-hidden flex flex-col">
      <Navbar />
      <main className="relative z-10 grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
