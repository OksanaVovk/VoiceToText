"use client";
import { useRouter } from "next/navigation";

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-2xl font-semibold text-red-600">
        ❌ Оплату скасовано або сталася помилка.
      </h1>
      <button
        onClick={() => router.push("/payment")}
        className="bg-yellow-500 text-white px-6 py-3 rounded-xl hover:bg-yellow-600 transition"
      >
        Повторити оплату
      </button>
    </div>
  );
}
