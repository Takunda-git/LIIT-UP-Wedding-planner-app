"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";




export default function HomePage() {
  const supabase = createClient();
  const router = useRouter();

 
  const weddingDate = new Date("2025-12-20T15:00:00");



  // Countdown state
  const [countdown, setCountdown] = useState<string>("");

  // Countdown logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate.getTime() - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [coupleName, setCoupleName] = useState<{ name: string; spouse_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.error("Error getting user:", userError?.message);
        router.push("/login");
        return;
      }

      const userId = userData.user.id;

      const { data, error } = await supabase
        .from("profiles")
        .select("name, spouse_name")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
      } else {
        setCoupleName(data);
      }

      setLoading(false);
    };

    getUserAndProfile();
  }, [router, supabase]);

  return (
    <div className="min-h-screen">
      <div className="text-center">
        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading your wedding details...</p>
        ) : coupleName ? (
          <div
            className="relative h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: "url('/venue.jpg')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-white/30 backdrop-brightness-75" />
            <div className="relative text-center z-10 px-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-white text-transparent bg-clip-text drop-shadow-lg mb-4 animate-pulse ">
                💍 Welcome, {coupleName.name} & {coupleName.spouse_name}!
              </h1>
              <p className="text-white text-2xl font-light mb-4">
                Your big day is coming! Let’s plan together.
              </p>

              {/* Aesthetic Countdown */}
              <div className="inline-block px-6 py-4 mt-2 rounded-2xl backdrop-blur-md border border-white/20 bg-white/10 shadow-lg">
                <p className="text-3xl md:text-4xl font-mono text-white tracking-wide animate-bounce">
                  ⏳ {countdown}
                </p>

                

                {/* Navigation */}
                <div className=" flex  gap-6 p-6  text-center  text-blue-200  drop-shadow-lg mb-4  items-center justify-center">
                  {[
                    { name: "Overview Planning", emoji: "📝", path: "/checklist" }, ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.path)}
                      className="bg-transparent hover:text-black  hover:bg-blue-200  rounded-2xl p-6 text-xl font-semibold  shadow-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group "
                    >
                      {item.emoji} {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-500">No wedding profile found. Please complete onboarding.</p>
        )}
      </div>
    </div>
  );
}
     



    



