export interface ProductDimensions {
  width: string;
  depth: string;
  height: string;
  seatHeight?: string;
}

export interface ProductMaterial {
  name: string;
  finish: string;
  colorHex?: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  designer: string;
  year: number;
  materials: ProductMaterial[];
  dimensions: ProductDimensions;
  description: string;
  isHeroFeatured?: boolean;
  modelUrl?: string;
}
