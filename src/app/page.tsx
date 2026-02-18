"use client";
import { useRouter } from "next/navigation";
import Dock from "./components/Dock.jsx";

export default function Home() {
  const router = useRouter();
  const items = [
    { icon: "🏏", label: "Cricket", onClick: () => router.push("/cricket") },
    { icon: "⚽", label: "Football", onClick: () => router.push("/football") },
  ];

  return (
    <div className="flex justify-center items-center h-screen bg-slate-900">
      <h1 className="text-4xl uppercase text-white">SP Lineup Builder</h1>
      <Dock
        items={items}
        panelHeight={80}
        baseItemSize={60}
        magnification={80}
      />
    </div>
  );
}
