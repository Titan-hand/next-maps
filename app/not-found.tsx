"use client";
import Link from "next/link";

const NotFound = () => {
  return (
    <div>
      <h3>404: Not Found</h3>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
      <Link href="/">
        <button>Go back home</button>
      </Link>
    </div>
  );
};

export default NotFound;
