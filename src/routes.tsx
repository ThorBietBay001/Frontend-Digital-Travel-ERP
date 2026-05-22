import { createBrowserRouter } from "react-router";
import Root from "./components/layout/Root";
import TrangChu from "./pages/TrangChu";
import ChiTietTour from "./pages/ChiTietTour";
import HoChieuSo from "./pages/HoChieuSo";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: TrangChu },
      { path: "tour/:tourId", Component: ChiTietTour },
      { path: "passport", Component: HoChieuSo },
      { path: "about", Component: AboutUs },
      { path: "*", Component: NotFound },
    ],
  },
]);
