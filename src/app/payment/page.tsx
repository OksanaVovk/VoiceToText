"use client";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

const Payment = () => {
  const { user } = useUser();
  const handlePay = async () => {
    try {
      const response = await axios.post("/api/stripe/create-checkout-session", {
        amount: 100, // = $1.00
        clerkUserId: user.id,
      });
      const { url } = response.data;

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Stripe session error:", error);
      alert("Сталася помилка при створенні сесії оплати.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Оплата за доступ
        </h2>
        <p className="text-gray-600">
          Для продовження користування сервісом Voice to Text здійсніть разову
          оплату:
        </p>
        <div className="flex items-end justify-center space-x-1">
          <span className="text-4xl font-bold text-blue-600">1</span>
          <span className="text-lg font-medium text-gray-700">$</span>
        </div>
        <button
          onClick={handlePay}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium"
        >
          Оплатити
        </button>
      </div>
    </div>
  );
};

export default Payment;
