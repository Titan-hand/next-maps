import NextLink from "next/link";
import { Button } from "@nextui-org/react";
import { UserButtonNavbar } from "./userButtonNavbar";
import { LoginButtonNavbar } from "./loginButtonNavbar";
import useAuth from "@/hooks/useAuth";

export const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto mt-5 w-full max-w-5xl px-4 flex items-center justify-between relative z-20">
      <p className="text-2xl font-bold z-20">LOGO</p>

      {!!user && (
        <div className="absolute left-0 right-0 z-10 flex flex-row justify-center items-center gap-4">
          <NextLink href="/map" passHref>
            <Button variant="light" size="lg">
              Map
            </Button>
          </NextLink>
          <NextLink href="/about" passHref>
            <Button variant="light" size="lg">
              About
            </Button>
          </NextLink>
        </div>
      )}

      <div className="z-20">{!!user ? <UserButtonNavbar /> : <LoginButtonNavbar />}</div>
    </div>
  );
};
