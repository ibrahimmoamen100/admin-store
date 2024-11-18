import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const { productIds, customerDetails } = await req.json();

  if (!productIds || productIds.length === 0) {
    return new NextResponse("Product ids are required", {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (!customerDetails || !customerDetails.phone) {
    return new NextResponse("Customer details are incomplete", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const products = await prismadb.product.findMany({
    where: { id: { in: productIds } },
  });

  if (!products || products.length === 0) {
    return new NextResponse("Products not found", {
      status: 404,
      headers: corsHeaders,
    });
  }

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: true, // Adjust payment handling as per your requirements
      phone: customerDetails.phone,

      address: `
      الاسم : ${customerDetails.country} -
      العنوان:  ${customerDetails.address} -
      المدينه: ${customerDetails.city} - 
      `,

      orderItems: {
        create: productIds.map((productId: string) => ({
          product: { connect: { id: productId } },
        })),
      },
    },
  });

  await prismadb.product.updateMany({
    where: { id: { in: productIds } },
    data: { isArchived: false },
  });

  return NextResponse.json(
    { message: "Order created successfully", orderId: order.id },
    { status: 200, headers: corsHeaders }
  );
}
