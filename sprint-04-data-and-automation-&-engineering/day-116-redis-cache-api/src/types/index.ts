export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CategoryWithCount extends Category {
  product_count: number;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  created_at: string;
}

export interface ProductWithCategory extends Product {
  category_name: string;
}

export interface PaginatedProducts {
  products: ProductWithCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductInput {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface UpdateProductInput {
  categoryId?: number;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  hitRate: string;
}
