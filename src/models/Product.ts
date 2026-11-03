import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuickSpecs {
  designer: string;
  produced: string;
  released: string;
  origin: string;
  material: string;
  dimensions: string;
}

export interface IStory {
  title: string;
  content: string;
  linkText: string;
  linkHref: string;
}

export interface ISpecItem {
  label: string;
  value: string;
}

export interface IProduct extends Document {
  id: string; // URL Slug / unique identifier e.g. "day-241-shack15-armchair"
  name: string;
  subtitle: string;
  category: string;
  breadcrumbCategory: string;
  sku: string;
  inStock: boolean;
  price: string;
  priceNum: number;
  image: string;
  is3D?: boolean;
  modelUrl?: string;
  quickSpecs: IQuickSpecs;
  story: IStory;
  additionalInfo: ISpecItem[];
  relatedProductIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuickSpecsSchema = new Schema<IQuickSpecs>(
  {
    designer: { type: String, default: "Studio Furnix" },
    produced: { type: String, default: "2024 Archival" },
    released: { type: String, default: "2026 Collection" },
    origin: { type: String, default: "Denmark / SF" },
    material: { type: String, default: "Solid European Oak" },
    dimensions: { type: String, default: "84 W × 88 D × 78 H cm" },
  },
  { _id: false }
);

const StorySchema = new Schema<IStory>(
  {
    title: { type: String, default: "Design & Heritage Story" },
    content: { type: String, default: "" },
    linkText: { type: String, default: "READ MORE ABOUT THE COLLECTION" },
    linkHref: { type: String, default: "/#collections" },
  },
  { _id: false }
);

const SpecItemSchema = new Schema<ISpecItem>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    subtitle: { type: String, default: "" },
    category: { type: String, default: "Living & Lounge" },
    breadcrumbCategory: { type: String, default: "LOUNGE & LIVING" },
    sku: { type: String, default: "FNX-STUDIO" },
    inStock: { type: Boolean, default: true },
    price: { type: String, required: true },
    priceNum: { type: Number, required: true },
    image: { type: String, default: "/images/chair_thumb_yellow.png" },
    is3D: { type: Boolean, default: false },
    modelUrl: { type: String, default: "" },
    quickSpecs: { type: QuickSpecsSchema, default: () => ({}) },
    story: { type: StorySchema, default: () => ({}) },
    additionalInfo: { type: [SpecItemSchema], default: [] },
    relatedProductIds: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in development during Next.js hot reloads
export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
