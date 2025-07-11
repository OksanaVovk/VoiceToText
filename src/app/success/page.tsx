"use client";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-2xl font-semibold text-green-600">
        ✅ Оплата пройшла успішно!
      </h1>
      <button
        onClick={() => router.push("/")}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
      >
        На головну
      </button>
    </div>
  );
}
