import React from "react";
import { Routes, Route,Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Shares from "./Shares";
import Payments from "./Payments";
import Loans from "./Loans";
import NavbarMember from "./NavbarMember";

import "../../styles/memberDashboard.css";

const MemberDashboard = () => {
  return (
    <div className="member-dashboard">
      <NavbarMember />  {/* NAVBAR MUST BE AT THE TOP */}

      <div className="dashboard-body">
        <Sidebar />  {/* SIDEBAR UNDER NAVBAR */}
        <div className="content">
          <Routes>
                        {/* default index -> redirect to shares */}
            <Route index element={<Navigate to="shares" replace />} />
            <Route path="shares" element={<Shares />} />
            <Route path="payments" element={<Payments />} />
            <Route path="loans" element={<Loans />} />
                        {/* fallback */}
            <Route path="*" element={<Navigate to="shares" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
