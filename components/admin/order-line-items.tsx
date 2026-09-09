import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { lineUnits, type OrderLine } from "@/lib/admin/order-lines";

function thumbSrc(line: OrderLine) {
  return line.product?.image_url || "/brand/rappi-logo.png";
}

export function OrderLineItems({ items }: { items: OrderLine[] }) {
  const units = lineUnits(items);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-end justify-between border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-sm font-bold uppercase tracking-wider">Items</h2>
        <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
          {items.length} line{items.length === 1 ? "" : "s"} · {units} unit{units === 1 ? "" : "s"}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-sm text-[var(--muted)]">No line items on this order.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[var(--hover)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-5 py-3 text-right">Line</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const productId = item.product?.id ?? item.product_id;
                const inner = (
                  <span className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbSrc(item)}
                      alt=""
                      className="h-14 w-14 rounded-lg bg-[var(--bg-elevated)] object-cover"
                    />
                    <span>
                      <span className="block font-mono font-bold">{item.code}</span>
                      <span className="block text-xs text-[var(--muted)]">{item.name}</span>
                      {item.product ? (
                        <span className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="muted">{item.product.category_slug}</Badge>
                          <Badge variant="muted">{item.product.gender}</Badge>
                          {item.product.badge ? (
                            <Badge variant={item.product.badge === "offer" ? "offer" : "new"}>
                              {item.product.badge}
                            </Badge>
                          ) : null}
                        </span>
                      ) : null}
                    </span>
                  </span>
                );
                return (
                  <tr key={item.id} className="border-t border-[var(--border)]">
                    <td className="px-5 py-3">
                      {productId ? (
                        <Link href={`/admin/products/${productId}`} className="hover:text-[var(--accent)]">
                          {inner}
                        </Link>
                      ) : (
                        inner
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold uppercase">{item.size}</td>
                    <td className="px-4 py-3 font-[family-name:var(--font-oswald)] text-xl">
                      {item.qty}
                    </td>
                    <td className="px-4 py-3">{formatPrice(item.unit_price)}</td>
                    <td className="px-5 py-3 text-right font-semibold">
                      {formatPrice(item.unit_price * item.qty)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function OrderLinesPreview({ items }: { items: { qty: number; code: string; size: string }[] }) {
  const units = lineUnits(items);
  if (!items.length) {
    return <p className="text-xs text-[var(--muted)]">No items</p>;
  }
  return (
    <div>
      <p className="text-sm font-semibold">
        {units} unit{units === 1 ? "" : "s"}
        <span className="ml-1 font-normal text-[var(--muted)]">
          · {items.length} line{items.length === 1 ? "" : "s"}
        </span>
      </p>
      <p className="mt-0.5 text-[11px] leading-5 text-[var(--muted)]">
        {items
          .slice(0, 3)
          .map((item) => `${item.qty}× ${item.code} ${item.size}`)
          .join(" · ")}
        {items.length > 3 ? ` +${items.length - 3}` : ""}
      </p>
    </div>
  );
}
