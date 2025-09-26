import { Outlet } from "react-router";

import "./AdminLayout.css";

export const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Outlet />
    </div>
  );
};
