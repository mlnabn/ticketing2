// src/components/WelcomeHomeUser.js
import React from "react";
import { motion } from "framer-motion";
import { HelpCircle, Clock, FileText } from "lucide-react";

const WelcomeHomeUser = ({ user, onGetStarted }) => {
  return (
    <div className="welcome-card-container min-h-screen flex flex-col items-center justify-center text-white px-6 relative overflow-hidden">
      {/* Background stars effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-indigo-950 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:20px_20px]" />

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold text-purple-400 mb-4 text-center relative z-10"
      >
        Welcome to Your Ticket {user}!
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-gray-300 text-lg text-center max-w-2xl mb-10 relative z-10"
      >
        Simplify your daily tasks and manage work efficiently with our Ticketing System.
      </motion.p>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 1 }}
        className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 
                   p-8 rounded-2xl shadow-2xl max-w-3xl border border-indigo-500/20 
                   hover:shadow-indigo-500/30 transition-all duration-500"
      >
        {/* Glow Behind Card */}
        <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />

        <div className="relative z-10 space-y-5">
          <p>
            Need Help? This platform is designed to simplify your daily tasks
            and improve efficiency. If you encounter any issues, you can:
          </p>

          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-500/20 shadow-inner">
                <HelpCircle className="w-5 h-5 text-blue-400" />
              </span>
              <span>Create and manage support tickets according to your needs.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-green-500/20 shadow-inner">
                <Clock className="w-5 h-5 text-green-400" />
              </span>
              <span>Track the progress of your tickets in real time.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-yellow-500/20 shadow-inner">
                <FileText className="w-5 h-5 text-yellow-400" />
              </span>
              <span>Review a complete history of all your past requests.</span>
            </li>
          </ul>

          <p className="text-gray-300">
            Our user-friendly interface ensures that you can easily submit a new
            request or monitor the status of an existing one. Use the navigation
            menu above to get started.
          </p>
          <p className="text-gray-300">
            If you have any further questions or need additional support, don’t
            hesitate to contact our support team. We are here to help you get the
            most out of our service.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}  // ✅ sudah fix
            className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 
                 hover:from-purple-500 hover:to-indigo-500 rounded-xl 
                 shadow-lg shadow-purple-600/40 text-white font-semibold transition-all"
          >
            🚀 Get Started
          </motion.button>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-gray-800 text-gray-500 text-sm mt-10 relative z-10">
        © 2025 Politeknik Negeri Semarang. All rights reserved.
      </footer>
    </div>
  );
};

export default WelcomeHomeUser;
