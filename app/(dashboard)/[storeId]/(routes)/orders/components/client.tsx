"use client";

import { OrderColumn } from "./columns";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import toast from "react-hot-toast";
import axios from "axios";

interface OrderClientProps {
  data: OrderColumn[];
  storeId: string;
}

export const OrderClient: React.FC<OrderClientProps> = ({ data, storeId }) => {
  const handleDeleteAllOrders = async () => {
    try {
      const response = await axios.delete(`/api/${storeId}/checkout`);

      if (response.status === 200) {
        toast.success("All orders deleted successfully");
        // Optionally, refresh the page or clear the orders from the state
      } else {
        toast.error("Failed to delete all orders");
      }
    } catch (error) {
      console.error("Error deleting all orders:", error);
      toast.error("An error occurred while deleting the orders");
    }
  };

  return (
    <>
      <Heading
        title={`Orders (${data.length})`}
        description="Manage orders for your store"
      />
      <Separator />
      <button
        onClick={handleDeleteAllOrders}
        className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
      >
        Delete All Orders
      </button>
      <DataTable columns={[]} data={data} searchKey="products" />
    </>
  );
};
