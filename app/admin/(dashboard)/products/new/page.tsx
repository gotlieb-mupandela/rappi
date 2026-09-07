import { ProductEditor } from "@/components/admin/product-editor";

export const metadata = { title: "New product · Admin" };

export default function NewProductPage() {
  return <ProductEditor productId={null} />;
}
