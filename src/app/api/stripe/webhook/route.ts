import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks = [];
  let done: boolean | undefined;
  while (!done) {
    const { value, done: isDone } = await reader.read();
    if (value) chunks.push(value);
    done = isDone;
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const rawBody = await buffer(req.body!);
  const sig = req.headers.get("stripe-signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const customerId = session.customer as string;

      // Find user by stripeCustomerId
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!user) {
        console.error(
          "❌ Користувача не знайдено для Stripe customer ID:",
          customerId
        );
        return new NextResponse("User not found", { status: 404 });
      }

      // Update user status
      await prisma.user.update({
        where: { id: user.id },
        data: { paymentStatus: "PAID" },
      });

      console.log(`✅ User ${user.email} paymentStatus updated to PAID`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new NextResponse("Webhook error", { status: 400 });
  }
}
