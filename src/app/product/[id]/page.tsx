import { redirect } from "next/navigation";
import { getAllProducts } from "@/lib/products";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export function generateStaticParams() {
  return getAllProducts().map((product) => ({
    id: product.id,
  }));
}

export default async function ProductAliasPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/products/${id}`);
}
