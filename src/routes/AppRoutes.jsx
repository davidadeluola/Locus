// import { useState } from "react";
import { Routes, Route } from "react-router-dom";

// import NotFound from "../pages/NotFound";

import Layout from "../components/shared/Layout";
import Landing from "../components/Landing";
// import Preloader from "../components/UI/Preloader";

const AppRoutes = () => {
  //   const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {/* The Preloader overlay */}
      {/* {isLoading && <Preloader onComplete={() => setIsLoading(false)} />} */}

      {/* Main App Content Container */}
      <div
      // className={`transition-opacity duration-1000 ease-in-out bg-zinc-950 ${
      //   isLoading ? "opacity-0 h-screen overflow-hidden" : "opacity-100 min-h-screen"
      // }`}
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="about" element={<Landing />} />
            <Route path="projects" element={<Landing />} />
            {/* <Route path="project/:slug" element={<ProjectDetailPage />} /> */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Route>
         
        </Routes>
      </div>
    </>
  );
};

export default AppRoutes;
