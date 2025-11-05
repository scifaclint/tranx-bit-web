"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function GetStarted() {
  return (
    <div className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-8 text-center">
        {/* Slogan */}
        <p className="text-2xl md:text-3xl font-medium text-gray-700 mb-8">
          Trade with trust, Move with TranXbit
        </p>

        {/* Get Started Button - styled like the signup button in header */}
        <div className="flex justify-center">
          <div className="relative inline-flex items-center justify-center group">
            <div className="absolute inset-0 duration-1000 opacity-60 transition-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200"></div>
            <Button className="relative bg-gray-900 px-8 py-3 rounded-xl text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30">
              Get Started
              <svg
                className="ml-2 inline-block stroke-white stroke-2"
                fill="none"
                width="10"
                height="10"
                viewBox="0 0 10 10"
                aria-hidden="true"
              >
                <path
                  className="transition opacity-0 group-hover:opacity-100"
                  d="M0 5h7"
                ></path>
                <path
                  className="transition group-hover:translate-x-[3px]"
                  d="M1 1l4 4-4 4"
                ></path>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
