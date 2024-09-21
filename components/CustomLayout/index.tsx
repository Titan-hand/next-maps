"use client";

import { Navbar } from "@/components/Navbar";
export const CustomLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Navbar />
      {children}
    </div>
  );
};
