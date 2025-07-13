"use client";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
      <h1 className="text-2xl font-semibold text-black">
        ✅ Payment was successful!
      </h1>
      <button
        onClick={() => router.push("/")}
        className="min-w-[120px] bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition font-medium"
      >
        Go to Home
      </button>
    </div>
  );
}
