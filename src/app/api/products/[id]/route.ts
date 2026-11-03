import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getProductById } from "@/lib/products";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const product = await Product.findOne({ id }).lean();

    if (!product) {
      // Fallback to static catalog if not found in DB
      const staticProduct = getProductById(id);
      if (staticProduct) {
        return NextResponse.json({ success: true, product: staticProduct, source: "static_fallback" });
      }
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product, source: "database" });
  } catch (error: any) {
    const { id } = await params;
    const fallback = getProductById(id);
    if (fallback) {
      return NextResponse.json({ success: true, product: fallback, source: "static_fallback" });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();

    if (body.price && typeof body.priceNum !== "number") {
      body.priceNum = parseFloat(String(body.price).replace(/[^0-9.]/g, "")) || 0;
    }

    if (body.priceNum && !body.price) {
      body.price = `$${body.priceNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Default 3D model is permanent and cannot be changed or untoggled
    if (id === "day-241-shack15-armchair") {
      body.is3D = true;
      body.modelUrl = "/models/arm_chair__furniture.glb";
    }

    const updated = await Product.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Prevent deletion of the default 3D showroom armchair
    if (id === "day-241-shack15-armchair") {
      return NextResponse.json(
        { success: false, error: "The default 3D showroom model (Bolle Lounge Chair) is permanent and cannot be deleted." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const deleted = await Product.findOneAndDelete({ id });

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Product ${id} deleted successfully` });
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
