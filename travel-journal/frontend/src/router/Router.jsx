import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PATHS } from "./RouterPath";
import LoginPage from "../components/page/LoginPage/LoginPage";
import RegisterPage from "../components/page/RegisterPage/RegisterPage";
import HomePage from "../components/page/HomePage/HomePage";
import ProfilePage from "../components/page/ProfilePage/ProfilePage";

const Routers = () => {
  const routers = createBrowserRouter([
    {
      path: PATHS.LOGIN,
      element: <LoginPage />,
    },
    {
      path: PATHS.REGISTER,
      element: <RegisterPage />,
    },
    {
      path: PATHS.HOME,
      element: <HomePage />,
    },
    {
      path: PATHS.PROFILE,
      element: <ProfilePage />,
    },
  ]);
  return <RouterProvider router={routers} />;
};

export default Routers;