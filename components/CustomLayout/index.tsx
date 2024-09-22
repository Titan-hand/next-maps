"use client";
import { Navbar } from "@/components/Navbar";

export const CustomLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="overflow-hidden flex flex-col w-full">
      <Navbar />
      {children}
    </div>
  );
};
