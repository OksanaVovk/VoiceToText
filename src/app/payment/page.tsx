"use client";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const Payment = () => {
  const { user } = useUser();
  const router = useRouter();

  const handlePay = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    try {
      const response = await axios.post("/api/stripe/create-checkout-session", {
        amount: 2000,
        clerkUserId: user.id,
      });

      const { url } = response.data;

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Stripe session error:", error);
      alert("An error occurred while creating the payment session.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg shadow-orange-200 max-w-md w-full text-center space-y-6 border border-orange-100">
        <h2 className="text-2xl font-semibold text-gray-800">
          Unlock Full Access
        </h2>
        <p className="text-gray-600">
          To continue using the Voice to Text service, please make a one-time
          payment:
        </p>
        <div className="flex items-end justify-center space-x-2">
          <span className="text-lg font-medium text-gray-700">$</span>
          <span className="text-4xl font-bold text-gray-800">20</span>
        </div>
        <button
          onClick={handlePay}
          className="min-w-[120px] bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition font-medium"
        >
          Pay Now
        </button>
        <p className="text-xs text-gray-400">
          Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
};

export default Payment;
