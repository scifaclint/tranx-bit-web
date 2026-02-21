"use client";

import { useState } from "react";
import OrderChat from "@/components/features/chat/OrderChat";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/hooks/useUIStore";

export default function Page() {
  const { setChatOpen, openChat } = useUIStore();
  const [isAdmin, setIsAdmin] = useState(true);

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center gap-8 p-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tight">Order Chat UI Verify</h1>
        <p className="text-muted-foreground font-medium">Testing real-time transitions and premium aesthetics</p>
      </div>

      <div className="flex bg-background p-1 rounded-2xl border border-border/40 shadow-xl ring-1 ring-black/5">
        <Button
          variant={isAdmin ? "default" : "ghost"}
          className={cn("rounded-xl px-8 font-bold", isAdmin && "shadow-lg shadow-primary/20 bg-primary text-primary-foreground")}
          onClick={() => setIsAdmin(true)}
        >
          Admin Perspective
        </Button>
        <Button
          variant={!isAdmin ? "default" : "ghost"}
          className={cn("rounded-xl px-8 font-bold", !isAdmin && "shadow-lg shadow-primary/20 bg-primary text-primary-foreground")}
          onClick={() => setIsAdmin(false)}
        >
          User Perspective
        </Button>
      </div>

      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={() => setChatOpen(true)}
          className="rounded-full px-12 h-14 text-lg font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          Open Inbox
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => openChat("TXB-10123")}
          className="rounded-full px-12 h-14 text-lg font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          Open Specific Order
        </Button>
      </div>

      <OrderChat isAdmin={isAdmin} />
    </div>
  );
}

// Helper to avoid import error if cn is needed in the test page
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
