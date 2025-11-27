import React from "react";
import { Routes, Route,Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import NavbarAdmin from "./NavbarAdmin";
import ManageUsers from "./ManageUsers";
import ManagePayments from "./Payments";
import ManageLoans from "./ManageLoans";
import ManageShares from "./ManageShares";
import "../../styles/admin.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <NavbarAdmin />
      <div className="dashboard-body">
        <Sidebar />
        <div className="content">
          <Routes>
                        {/* Default visible page → users */}
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="loans" element={<ManageLoans />} />
            <Route path="shares" element={<ManageShares />} />
                        {/* fallback for unknown paths */}
            <Route path="*" element={<Navigate to="users" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
