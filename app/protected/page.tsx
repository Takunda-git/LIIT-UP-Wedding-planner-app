// ProtectedPage.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProtectedPage() {
  const supabase = createClient();
  const router = useRouter();

  const [message, setMessage] = useState("Confirming email...");

  useEffect(() => {
    const checkSession = async () => {
      // Small delay to ensure Supabase is hydrated
      await new Promise((r) => setTimeout(r, 300));

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        setMessage("Email confirmed! Please log in.");
        setTimeout(() => router.push("/logIn"), 3000);
        return;
      }

      const userId = sessionData.session.user.id;

      // ✅ Check if profile data exists
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("name")
        .eq("user_id", userId)
        .single();

      if (profileError || !profileData) {
        setMessage("Email confirmed! Redirecting to assistant...");
        setTimeout(() => router.push("/wedding-assistant"), 2000);
      } else {
        setMessage("Email confirmed! Redirecting to home...");
        setTimeout(() => router.push("/home"), 2000);
      }
    };

    checkSession();
  }, [router, supabase]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>{message}</p>
    </div>
  );
}


