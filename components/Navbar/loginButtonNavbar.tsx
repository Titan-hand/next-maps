import Link from "next/link";
import { Button } from "@heroui/react";
export const LoginButtonNavbar = () => {
  return (
    <Link href="/login">
      <Button variant="light" size="lg">
        Login
      </Button>
    </Link>
  );
};
