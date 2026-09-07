import { OrderDetail } from "@/components/admin/order-detail";

export const metadata = { title: "Order · Admin" };

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}
