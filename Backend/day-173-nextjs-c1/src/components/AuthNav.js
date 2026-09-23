import React from "react";
import Link from "next/link";

function NavBar() {
  return (
    <div className="flex gap-6">
      <Link href={"/authlayout/login"}>Login</Link>
      <Link href={"/authlayout/register"}>Register</Link>
    </div>
  );
}

export default NavBar;
