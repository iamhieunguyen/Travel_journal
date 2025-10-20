import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PATHS } from "./RouterPath";
import LoginPage from "../components/page/LoginPage/LoginPage";
import RegisterPage from "../components/page/RegisterPage/RegisterPage";

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
  ]);
  return <RouterProvider router={routers} />;
};

export default Routers;
