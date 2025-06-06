"use client";
import { Navbar } from "@/components/Navbar";

export const CustomLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-full flex flex-col w-full">
      <Navbar />
      <div className="flex-1">{children}</div>
    </div>
  );
};
