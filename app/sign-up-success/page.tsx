"use client";

import React from "react";

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black text-center px-4">
      <h1 className="text-3xl font-bold mb-4">🎉 Account Created!</h1>
      <p className="text-gray-600 mb-6">
        We've sent a confirmation email. Please verify your email to continue.
      </p>

      <a
        href="https://mail.google.com"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-500 text-white px-5 py-3 rounded-lg shadow-md hover:bg-blue-600 transition"
      >
        📬 Open Gmail to Confirm
      </a>

      <p className="text-sm text-gray-400 mt-4">
        Use the same browser where you're logged into your email.
      </p>
    </div>
  );
}



