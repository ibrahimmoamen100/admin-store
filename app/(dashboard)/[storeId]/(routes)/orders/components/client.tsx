"use client";

import { OrderColumn, columns } from "./columns";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import toast from "react-hot-toast";
import axios from "axios";

interface OrderClientProps {
  data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({ data }) => {
  // Function to delete an order
  const handleDelete = async (orderId: string) => {
    try {
      const response = await axios.delete(`/api/checkout?orderId=${orderId}`);

      if (response.status === 200) {
        toast.success("Order deleted successfully");
        // Optionally, refresh the page or filter out the deleted order
      } else {
        toast.error("Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("An error occurred while deleting the order");
    }
  };

  return (
    <>
      <Heading
        title={`Orders (${data.length})`}
        description="Manage orders for your store"
      />
      <Separator />
      <DataTable
        columns={[
          ...columns,
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
              <button
                onClick={() => handleDelete(row.original.id)}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Delete
              </button>
            ),
          },
        ]}
        data={data}
        searchKey="products"
      />
    </>
  );
};
