import { Routes, Route, Link } from "react-router";
import Home from "./pages/Home.jsx";
import Contact from "./pages/Contact.jsx";
import About from "./pages/About.jsx";
import Service from "./pages/Service.jsx";
import Moblie from "./pages/Moblie.jsx";
import Laptop from "./pages/Laptop.jsx";
import Course from "./pages/Course.jsx";
import CourseDetailes from "./pages/CourseDetailes.jsx";

const App = () => {
  return (
    <div>
      <div className="bg-gray-300 w-full h-20 py-4 px-8 flex items-center justify-between">
        <h1 className="text-2xl">Hello</h1>
        <div className=" flex items-center gap-10">
          <Link to="/">Home</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/service">Service</Link>
          <Link to="/about">About</Link>
          <Link to="/course">Course</Link>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/Contact" element={<Contact />} />

        <Route path="/service" element={<Service />}>
          <Route path="mobile" element={<Moblie />} />
          <Route path="lappy" element={<Laptop />} />
        </Route>

        <Route path="/course" element={<Course />} />
        <Route path="/course/:Chaman" element={<CourseDetailes />} />
        
        <Route
          path="*"
          element={
            <h1 className="text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-x-1/2 ">
              404 | Page Not Found
            </h1>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
