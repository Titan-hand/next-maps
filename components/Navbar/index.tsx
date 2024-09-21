import NextLink from "next/link";
import { UserButtonNavbar } from "./userButtonNavbar";
import { LoginButtonNavbar } from "./loginButtonNavbar";
import useAuth from "@/hooks/useAuth";
import { HEADER_HEIGHT } from "@/const/stylesConst";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const { user } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  return (
    <div
      className="mx-auto mt-5"
      style={{
        width: "100%",
        maxWidth: "1000px",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        zIndex: 2,
      }}
    >
      <p style={{ fontSize: "24px", fontWeight: "bold", zIndex: 2 }}>LOGO</p>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          left: 0,
          right: 0,
          zIndex: 1,
          gap: "16px",
        }}
      >
        <NextLink href="/map" passHref>
          Map
        </NextLink>
        <NextLink href="/about" passHref>
          About
        </NextLink>
      </div>

      <div style={{ zIndex: 2 }}>{isLoggedIn ? <UserButtonNavbar /> : <LoginButtonNavbar />}</div>
    </div>
  );
};
