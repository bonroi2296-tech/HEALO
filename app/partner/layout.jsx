"use client";

import { HospitalGateClient } from "./_components/HospitalGateClient";
import { HospitalNav } from "./_components/HospitalNav";

export default function HospitalLayout({ children }) {
  return (
    <HospitalGateClient>
      <div className="flex min-h-screen bg-gray-50 pt-12">
        <HospitalNav />
        <main className="flex-1 pt-14 lg:pt-0">
          <div className="px-4 sm:px-6 lg:px-10 py-4 lg:py-0">
            {children}
          </div>
        </main>
      </div>
    </HospitalGateClient>
  );
}
