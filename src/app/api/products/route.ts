import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { PRODUCTS_CATALOG } from "@/lib/products";

// Helper: auto-seed catalog if collection is empty
async function ensureSeeded() {
  const count = await Product.countDocuments();
  if (count === 0) {
    console.log("Seeding MongoDB with initial Furnix catalog items...");
    await Product.insertMany(PRODUCTS_CATALOG);
    console.log(`Successfully seeded ${PRODUCTS_CATALOG.length} products into MongoDB.`);
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    await ensureSeeded();
    const products = await Product.find({}).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, count: products.length, products, source: "database" });
  } catch (error: any) {
    console.error("Database connection failed in /api/products, falling back to static catalog:", error);
    return NextResponse.json({
      success: true,
      count: PRODUCTS_CATALOG.length,
      products: PRODUCTS_CATALOG,
      source: "static_fallback",
      error: error.message,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.price) {
      return NextResponse.json(
        { success: false, error: "Product name and price are required" },
        { status: 400 }
      );
    }

    // Auto-generate slug ID if not provided
    const baseId =
      body.id ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    // Check for collision
    const existing = await Product.findOne({ id: baseId });
    const finalId = existing ? `${baseId}-${Date.now().toString().slice(-4)}` : baseId;

    const priceNum =
      typeof body.priceNum === "number"
        ? body.priceNum
        : parseFloat(String(body.price).replace(/[^0-9.]/g, "")) || 0;

    const priceFormatted =
      typeof body.price === "string" && body.price.startsWith("$")
        ? body.price
        : `$${priceNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const newProduct = new Product({
      id: finalId,
      name: body.name,
      subtitle: body.subtitle || "Curated Edition",
      category: body.category || "Living & Lounge",
      breadcrumbCategory: body.breadcrumbCategory || (body.category || "Living & Lounge").toUpperCase(),
      sku: body.sku || `FNX-${Math.floor(1000 + Math.random() * 9000)}`,
      inStock: body.inStock ?? true,
      price: priceFormatted,
      priceNum: priceNum,
      image: body.image || "/images/chair_thumb_yellow.png",
      is3D: Boolean(body.is3D),
      modelUrl: body.modelUrl || "",
      quickSpecs: body.quickSpecs || {
        designer: "Studio Furnix",
        produced: "2026 Studio",
        released: "2026 Collection",
        origin: "Denmark / SF",
        material: "Solid Hardwood",
        dimensions: "84 W × 88 D × 78 H cm",
      },
      story: body.story || {
        title: "Design Philosophy",
        content: body.subtitle || "Designed with sculptural restraint for slow living spaces.",
        linkText: "EXPLORE THE ARCHIVE",
        linkHref: "/#collections",
      },
      additionalInfo: body.additionalInfo || [
        { label: "CONSTRUCTION", value: "Hand-Joined Hardwood" },
        { label: "WARRANTY", value: "10-Year Frame Coverage" },
      ],
      relatedProductIds: body.relatedProductIds || ["day-241-shack15-armchair", "cyan-armchair"],
    });

    await newProduct.save();
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
