"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function WeddingAssistantPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [spouseName, setSpouseName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [budget, setBudget] = useState("");
  const [step, setStep] = useState(-1); // start before question 0
  const [message, setMessage] = useState("");

  const steps = [
    {
      question: "💁‍♀️ What’s your name, love?",
      placeholder: "Type your name here",
      value: name,
      setValue: setName,
    },
    {
      question: "👩‍❤️‍👨 What’s your spouse’s name?",
      placeholder: "Type their name here",
      value: spouseName,
      setValue: setSpouseName,
    },
    {
      question: "💸 What’s your estimated budget in USD?",
      placeholder: "Enter your budget",
      value: budget,
      setValue: setBudget,
    },
    {
      question: "📅 When’s the big day?",
      placeholder: "Select wedding date",
      value: weddingDate,
      setValue: setWeddingDate,
      type: "date",
    },
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }
      const user = data.user;
      if (user) {
        setUserId(user.id);
        //  Start assistant after loading
        setTimeout(() => setStep(0), 2000);
      } else {
        router.push("/login");
      }
    };
    getUser();
  }, [router]);

  const handleNext = async () => {
    if (step === steps.length - 1) {
      if (!userId) return;

      const { error } = await supabase.from("profiles").insert([
        {
          user_id: userId,
          name,
          spouse_name: spouseName,
          wedding_date: weddingDate,
          budget: parseFloat(budget),
        },
      ]);
      if (error) {
        setMessage("❌ Oops! Something went wrong: " + error.message);
      } else {
        setMessage("✅ Profile saved! Let’s start planning 🎊");
        setTimeout(() => router.push("/home"), 2500);
      }
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-white text-black">
      {/* Lexie Assistant Header */}
      <div className="flex flex-col items-center text-center">
        <img
          src="/AI.jpg"
          alt="Lexie"
          className="w-36 h-36 object-cover rounded-full mb-4"
        />
        <h3 className="text-xl font-semibold text-black">Hi, I'm <span className="text-red-500">Lexie 💍</span></h3>
        <p className="text-sm text-gray-700 px-4 mt-2">
          Your wedding assistant planner.  
          I’m here to help you set up your profile in seconds ✨
        </p>
      </div>

      {/* Chat Flow Style */}
      <div className="w-full max-w-md mt-10 text-center">
        {step >= 0 && step < steps.length && (
          <>
            <div className="mb-6 bg-pink-100 p-4 rounded-xl text-left shadow-sm">
              <p className="text-lg">{steps[step].question}</p>
            </div>
            <input
              type={steps[step].type || "text"}
              placeholder={steps[step].placeholder}
              value={steps[step].value}
              onChange={(e) => steps[step].setValue(e.target.value)}
              className="border px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <button
              onClick={handleNext}
              className="mt-4 bg-pink-400/70 hover:bg-gradient-to-br from-pink-400 to-blue-400 text-white px-6 py-2 rounded-4xl shadow-md transition"
            >
              {step === steps.length - 1 ? "✨ Start Planning" : "Next →"}
            </button>
          </>
        )}

        {step === -1 && (
          <div className="mt-8 text-sm text-gray-600 animate-pulse">
            Loading Lexie... 🤖
          </div>
        )}

        {message && (
          <p className="mt-4 text-sm text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
}


