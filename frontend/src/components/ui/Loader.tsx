"use client";

import React from "react";

interface LoaderProps {
  label?: string;
  fullscreen?: boolean;
}

export function Loader({ label = "Loading Portal...", fullscreen = false }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-4 text-center animate-fade-in">
      <div className="uiverse-loader-wrapper mb-8">
        <div className="uiverse-loader-circle"></div>
        <div className="uiverse-loader-circle2"></div>
        <div className="uiverse-loader-circle"></div>
        <div className="uiverse-loader-shadow"></div>
        <div className="uiverse-loader-shadow"></div>
        <div className="uiverse-loader-shadow"></div>
      </div>
      {label && (
        <div className="mt-2 flex flex-col items-center gap-1.5">
          <span className="text-sm font-bold tracking-wider text-slate-800 uppercase animate-pulse">
            {label}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Please wait while we prepare your screen
          </span>
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/80 backdrop-blur-sm w-full h-full min-h-screen">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full py-12">
      {content}
    </div>
  );
}
