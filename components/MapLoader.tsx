"use client";
import { use100vh } from "react-div-100vh";
import { Spinner } from "@heroui/react";

export default function MapLoader() {
  const h = use100vh();

  return (
    <div
      className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
      style={{ height: h || "100vh" }}
    >
      {/* Loading spinner */}
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <Spinner
            size="lg"
            color="primary"
            classNames={{
              circle1: "border-b-primary",
              circle2: "border-b-primary-400",
            }}
          />

          {/* Pulsing background effect */}
          <div className="absolute inset-0 -m-4 bg-primary/10 rounded-full animate-pulse"></div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-700">Loading Map</h2>
          <p className="text-sm text-gray-500 animate-pulse">
            Getting your location and setting up the map...
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-16 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 right-10 w-16 h-16 bg-purple-200/25 rounded-full blur-lg"></div>
    </div>
  );
}
