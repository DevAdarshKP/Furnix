import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { PRODUCTS_CATALOG } from "@/lib/products";

export async function POST() {
  try {
    await connectToDatabase();
    
    // Clear and re-populate
    await Product.deleteMany({});
    const inserted = await Product.insertMany(PRODUCTS_CATALOG);

    return NextResponse.json({
      success: true,
      message: `Database successfully re-seeded with ${inserted.length} archival products.`,
      count: inserted.length,
    });
  } catch (error: any) {
    console.error("Seeding failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
