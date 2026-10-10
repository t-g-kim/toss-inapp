import React from "react";
import { SpendingReceiptApp } from "../SpendingReceiptApp";

export const App: React.FC = () => {
  return (
    <main className="w-full min-h-screen bg-toss-bg max-w-md mx-auto">
      <SpendingReceiptApp />
    </main>
  );
};
