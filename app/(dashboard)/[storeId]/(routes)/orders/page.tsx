import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";
import axios from "axios";
import { toast } from "react-hot-toast";
import { OrderClient } from "./components/client";
import { OrderColumn } from "./components/columns";

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formatedOrders: OrderColumn[] = orders.map((item) => ({
    id: item.id,
    phone: item.phone,
    address: item.address,
    products: item.orderItems
      .map((orderItem) => orderItem.product.name)
      .join(", "),
    totalPrice: formatter.format(
      item.orderItems.reduce((total, item) => {
        return total + Number(item.product.price);
      }, 0)
    ),
    isPaid: item.isPaid,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));
  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `/api/checkout` // Adjust the endpoint if necessary
      );

      if (response.status === 200) {
        toast.success("Order deleted successfully");
        // Optionally, refresh the page or update the state to remove the deleted order from the UI
      } else {
        toast.error("Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("An error occurred while deleting the order");
    }
  };

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <OrderClient data={formatedOrders} />
        <button
          onClick={() => handleDelete()}
          className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default OrdersPage;
