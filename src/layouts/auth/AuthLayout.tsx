import { Outlet } from "react-router";
import menteMaestraLogo from "@/assets/images/mente-maestra-logo.png";

import "./AuthLayout.css";

export const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="container">
        <img
          src={menteMaestraLogo}
          alt="Mente Maestra"
          className="mente-maestra-logo"
        />

        <Outlet />
      </div>
    </div>
  );
};
