import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";

const ProductPage = async ({
  params,
}: {
  params: { productId: string; storeId: string };
}) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
      sizes: {
        include: {
          size: true,
        },
      },
      colors: {
        include: {
          color: true,
        },
      },
    },
  });

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const availableSizes = await prismadb.size.findMany({
    where: {
      storeId: params.storeId,
    },
  });
  const availableColors = await prismadb.color.findMany({
    where: {
      storeId: params.storeId,
    },
  });
  // Add the `sizeIds` field by mapping the `sizes` relation
  const initialData = product
    ? {
        ...product,
        // sizeIds: product.sizes.map((ps) => ps.size.id),
        sizes: product.sizes.map((ps) => ps.size),
        colors: product.colors.map((pc) => pc.color),
      }
    : null;

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ProductForm
          categories={categories}
          sizes={availableSizes}
          colors={availableColors}
          initialData={initialData}
        />
      </div>
    </div>
  );
};
export default ProductPage;
