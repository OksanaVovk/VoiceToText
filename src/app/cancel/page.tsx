"use client";
import { useRouter } from "next/navigation";

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
      <h1 className="text-2xl font-semibold text-black">
        ❌ Payment was cancelled or an error occurred.
      </h1>
      <button
        onClick={() => router.push("/payment")}
        className="min-w-[120px] bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition font-medium"
      >
        Try Again
      </button>
    </div>
  );
}
