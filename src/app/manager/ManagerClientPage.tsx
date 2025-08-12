'use client';

import { useState } from 'react';
import ProductTable from '@/components/ProductTable';
import CreateProductModal from '@/components/CreateProductModal';
import type { Product } from '@/lib/types';

interface ManagerClientPageProps {
  initialProducts: Product[];
}

export default function ManagerClientPage({ initialProducts }: ManagerClientPageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const handleProductCreated = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <CreateProductModal onProductCreated={handleProductCreated} />
      </div>
      <ProductTable products={products} onProductsChange={setProducts} role="owner" />
    </div>
  );
}
