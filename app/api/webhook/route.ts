import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.metadata) {
      const order = await prismadb.order.update({
        where: { id: session.metadata.orderId },
        data: {
          isPaid: true,
          phone: session.metadata.customerPhone,
          address: `${session.metadata.customerAddress}, ${session.metadata.customerCity}, ${session.metadata.customerCountry}`,
        },
        include: { orderItems: true },
      });

      const productIds = order.orderItems.map(
        (orderItem) => orderItem.productId
      );

      await prismadb.product.updateMany({
        where: { id: { in: productIds } },
        data: { isArchived: true },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
