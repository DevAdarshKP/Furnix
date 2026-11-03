import React, { Suspense } from "react";
import { getAllProducts } from "@/lib/products";
import { CartItemContent } from "./CartItemContent";

interface CartItemPageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export function generateStaticParams() {
  return getAllProducts().map((product) => ({
    id: product.id,
  }));
}

export default function CartItemPage({ params }: CartItemPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-[#141210]">
          <div className="w-8 h-8 rounded-full border-2 border-[#141210] border-t-transparent animate-spin" />
        </div>
      }
    >
      <CartItemContent params={params} />
    </Suspense>
  );
}
