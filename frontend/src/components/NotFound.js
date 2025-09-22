import React from "react";

export default function NotFound({ setAppPage }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
        Oops! Halaman yang kamu cari tidak ditemukan.
      </p>
      <button
        onClick={() => setAppPage("landing")}
        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
      >
        Kembali ke Home
      </button>
    </div>
  );
}

