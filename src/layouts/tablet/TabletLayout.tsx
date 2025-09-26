import { Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import defaultAvatar from "@/assets/images/avatar_00.png";

import "./TabletLayout.css";
import { useTabletGame } from "@/hooks/useGame";

export const TabletLayout = () => {
  const { user } = useAuth();
  const { currentRoom } = useTabletGame();

  return (
    <div className="tablet-layout">
      {user ? (
        <div className="player-info">
          {user?.username}
          <figure className="player-info__avatar">
            <img src={user?.avatar || defaultAvatar} alt={user?.username} />
          </figure>
        </div>
      ) : null}
      {currentRoom ? (
        <div className="room-info">{currentRoom?.name}</div>
      ) : null}
      <Outlet />
    </div>
  );
};
