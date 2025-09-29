import { Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import defaultAvatar from "@/assets/images/avatar_00.png";

import "./AppLayout.css";

export const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      {user ? (
        <div className="player-info">
          {user?.username}
          <figure className="player-info__avatar">
            <img src={user?.avatar || defaultAvatar} alt={user?.username} />
          </figure>
        </div>
      ) : null}
      <Outlet />
    </div>
  );
};
