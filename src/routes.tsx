import { createBrowserRouter } from "react-router";
import Root from "./components/layout/Root";
import Home from "./pages/Home";
import TourDetail from "./pages/TourDetail";
import DigitalPassport from "./pages/DigitalPassport";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "tour/:tourId", Component: TourDetail },
      { path: "passport", Component: DigitalPassport },
      { path: "about", Component: AboutUs },
      { path: "*", Component: NotFound },
    ],
  },
]);
