import { Outlet } from "react-router";
import menteMaestraLogo from "@/assets/images/mente-maestra-logo.png";

import "./AuthLayout.css";

export const AuthLayout = () => {
  // const { currentRoom } = useTabletGame();

  return (
    <div className="auth-layout">
      <div className="container">
        <img
          src={menteMaestraLogo}
          alt="Mente Maestra"
          className="mente-maestra-logo"
        />

        {/* {currentRoom && (
          <div className="glass-card room-info font-bold">
            {currentRoom.name}
          </div>
        )} */}
        <Outlet />
      </div>
    </div>
  );
};
