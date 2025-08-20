"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/app/Components/ui/button";

export default function LogoutPage() {
  const router = useRouter();
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    const logout = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      setIsLoggedOut(true);
    };

    logout();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center p-4">
      {isLoggedOut ? (
        <>
          <h1 className="text-4xl font-bold mb-4 animate-bounce">You have been logged out.</h1>
          <Button onClick={() => router.push("/login")} className="bg-blue-500 text-white hover:bg-gradient-to-br from-pink-400 to-blue-400 hover:text-black transition-colors">
            Login to your account
          </Button>
        </>
      ) : (
        <h1 className="text-xl font-semibold animate-pulse">Logging you out...</h1>
      )}
    </div>
  );
}

