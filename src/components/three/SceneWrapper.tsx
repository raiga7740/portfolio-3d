"use client";

import dynamic from "next/dynamic";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), {
  ssr: false,
});

export default function SceneWrapper() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {/* Soft ambient radial light washes behind the 3D frosted sculpture */}
      <div className="absolute -top-36 right-[12%] h-[420px] w-[420px] rounded-full bg-slate-200/45 blur-[120px]" />
      <div className="absolute bottom-[-120px] left-[8%] h-[380px] w-[380px] rounded-full bg-sky-100/50 blur-[120px]" />
      <SceneCanvas />
    </div>
  );
}

