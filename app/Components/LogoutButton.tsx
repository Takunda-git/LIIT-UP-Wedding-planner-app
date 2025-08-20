"use client";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/logout"); // Navigate to the logout page
  };

  return (
    <Button onClick={handleClick} className="flex items-center gap-2">
      <LogOut size={18} />
      Logout
    </Button>
  );
}