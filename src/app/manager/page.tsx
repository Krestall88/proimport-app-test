'use client';

import { useState, useEffect } from 'react';
import ProductTable from '@/components/ProductTable';
import CreateProductModal from '@/components/CreateProductModal';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import { toast } from 'sonner';

type Product = Database['public']['Tables']['products']['Row'];

export default function ManagerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        toast.error('Ошибка при загрузке товаров');
      } else {
        setProducts(data || []);
      }
    };
    fetchProducts();
  }, []);

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
