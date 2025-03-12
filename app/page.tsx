"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("All");
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-16">
      <div className="w-full max-w-md space-y-8">
        <SegmentedControl 
          tabs={["All", "Draft", "Review", "Signing", "Signed"]} 
          defaultTab={activeTab}
          onChange={handleTabChange}
        />
        <div className="text-center text-gray-500">
          Current tab: <span className="font-medium">{activeTab}</span>
        </div>
      </div>
    </main>
  );
}
