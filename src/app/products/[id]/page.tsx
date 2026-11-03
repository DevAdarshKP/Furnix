import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductById, getAllProducts } from "@/lib/products";
import { SingleProductView } from "@/components/product/SingleProductView";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastNotification } from "@/components/cart/ToastNotification";

import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export function generateStaticParams() {
  return getAllProducts().map((product) => ({
    id: product.id,
  }));
}

async function getLiveProduct(id: string) {
  try {
    await connectToDatabase();
    const dbProduct = await Product.findOne({ id }).lean();
    if (dbProduct) {
      return JSON.parse(JSON.stringify(dbProduct));
    }
  } catch (err) {
    // MongoDB fallback
  }
  return getProductById(id);
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getLiveProduct(id);

  if (!product) {
    return {
      title: "Product Not Found — FURNIX",
    };
  }

  return {
    title: `${product.name} — FURNIX Archival Collection`,
    description: product.story?.content?.slice(0, 160) || product.subtitle,
    openGraph: {
      title: `${product.name} — FURNIX`,
      description: `${product.name} (${product.price}) - ${product.subtitle}`,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getLiveProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF8F5] text-[#141210]">
      {/* Global Interactive Shopping Bag Drawer & Notifications */}
      <CartDrawer />
      <ToastNotification />

      {/* Persistent Navigation */}
      <Navbar />

      {/* Main Single Product Details Content */}
      <main className="flex-1">
        <SingleProductView product={product} />
      </main>

      {/* Atmospheric Architectural Footer */}
      <Footer />
    </div>
  );
}
