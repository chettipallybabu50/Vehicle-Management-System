"use client";
import Dashboard from "@/components/dashboard";
import MovingNote from "@/components/movingnote";

import React from "react";
 // Adjust path as needed

export default function Page() {
  return (
    <div className="dashboard-container" style={{margin:"0.7rem" }}>
      <MovingNote />
      <div className="dashboard-content">
        <h2 className="dashboard-title" style={{ color: "blueviolet", marginBottom:"1rem" }}>Security Dashboard</h2>
        <Dashboard />
      </div>
    </div>
  );
}
