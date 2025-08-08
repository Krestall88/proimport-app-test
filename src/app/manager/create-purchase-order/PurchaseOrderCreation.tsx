'use client';

import { useState, useEffect } from 'react';
import ProductTable from '@/components/ProductTable';
import CreateProductModal from '@/components/CreateProductModal';
import { createPurchaseOrder } from './actions';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

import type { Product, Supplier, PurchaseOrderItem } from '@/lib/types';


type CartItem = { product: Product; qty: number };

export default function PurchaseOrderCreation() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('managerPurchaseOrderCart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [suppliers, setSuppliers] = useState<Supplier[]>([]); // глобальный тип Supplier
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Автоматическая загрузка позиций из localStorage (wishlist)
  // Подписка на изменения managerPurchaseOrderCart (корзины руководителя)
  useEffect(() => {
    const syncCart = () => {
      try {
        const saved = localStorage.getItem('managerPurchaseOrderCart');
        setCart(saved ? JSON.parse(saved) : []);
      } catch {
        setCart([]);
      }
    };
    window.addEventListener('storage', syncCart);
    window.addEventListener('managerCartUpdated', syncCart);
    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('managerCartUpdated', syncCart);
    };
  }, []);

  useEffect(() => {
    // fetchSuppliers и fetchProducts ниже
    const fetchSuppliers = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('suppliers').select('*');
      if (error) {
        toast.error('Ошибка при загрузке поставщиков');
      } else {
        setSuppliers((data ?? []).map((s: any) => ({
  ...s,
  contacts: typeof s.contacts === 'object' && s.contacts !== null ? s.contacts : { phone: null, email: null }
})));
      }
    };
        fetchSuppliers();

    const fetchProducts = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        toast.error('Ошибка при загрузке товаров');
      } else {
        setProducts((data ?? []).map((p: any) => ({
  ...p,
  nomenclature_code: p.nomenclature_code ?? ''
})) as Product[]);
      }
    };
    fetchProducts();
  }, []);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const addToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity <= 0) {
        toast.error('Количество должно быть больше нуля');
        return;
    }

    const safeProduct: Product = {
      ...product,
      category: product.category ?? '',
      unit: product.unit ?? '',
      expiry_date: product.expiry_date ?? '',
      batch_number: product.batch_number ?? '',
    };

    setCart(prev => {
        const existingItem = prev.find(item => item.product.id === product.id);
        const updated = existingItem
          ? prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + quantity } : item)
          : [...prev, { product: safeProduct, qty: quantity }];
        // Сохраняем корзину в localStorage
        localStorage.setItem('managerPurchaseOrderCart', JSON.stringify(updated));
        return updated;
    });
    toast.success(`${product.title} добавлен в корзину`);
  };

    const handleProductCreated = (newProduct: Product, quantity: number) => {
    const safeProduct: Product = {
      ...newProduct,
      category: newProduct.category ?? '',
      unit: newProduct.unit ?? '',
      expiry_date: newProduct.expiry_date ?? '',
      batch_number: newProduct.batch_number ?? '',
    };
    setProducts(prev => [...prev, safeProduct]);
    setCart(prev => [...prev, { product: safeProduct, qty: quantity }]);
    toast.success(`${safeProduct.title} добавлен в корзину`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const updated = prev.filter(item => item.product.id !== productId);
      localStorage.setItem('managerPurchaseOrderCart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreateOrder = async (expectedDeliveryDate?: string) => {
  if (!expectedDeliveryDate) {
    toast.error('Укажите ожидаемую дату поставки');
    return;
  }
    if (!selectedSupplier) {
      toast.error('Пожалуйста, выберите поставщика.');
      return;
    }
    if (cart.length === 0) {
      toast.error('Корзина пуста.');
      return;
    }

    setIsCreating(true);
    try {
      const result = await createPurchaseOrder(selectedSupplier, cart, expectedDeliveryDate);
      if (result.error) {
        toast.error('Ошибка при создании заказа', { description: result.error.message });
      } else {
        toast.success(`Заказ на поставку #${result.purchaseOrderId} успешно создан.`);
        setCart([]);
        setQuantities({});
        setSelectedSupplier(null);
        // После успешного создания заказа очищаем корзину wishlist и корзину руководителя
        localStorage.removeItem('purchaseOrderCart');
        localStorage.removeItem('managerPurchaseOrderCart');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const renderAddToCartColumn = (product: Product) => (
    <div className="flex items-center space-x-2">
      <Input
        type="number"
        min={1}
        className="w-20"
        value={quantities[product.id] || ''}
        onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value, 10) || 0)}
        placeholder="Кол-во"
      />
      <Button onClick={() => addToCart(product)}>Добавить</Button>
    </div>
  );

    return (
    <div className="p-4 space-y-8">
      {/* Top Section: Product Selection */}
      <div>
        <div className="flex justify-between items-center mb-4">
          
          <CreateProductModal onProductCreated={handleProductCreated} />
        </div>
        <div className="border rounded-lg">
          <ProductTable 
            products={products}
            onProductsChange={setProducts}
            role="warehouse_manager" 
            renderAddToCartColumn={renderAddToCartColumn} 
          />
        </div>
      </div>

      {/* Bottom Section: Cart and Supplier */}
      <div>
        
        <div className="flex items-start space-x-4">
          <div className="flex-grow border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Цена продажи</TableHead>
                  <TableHead>Ед. изм.</TableHead>
                  <TableHead>Количество</TableHead>
                  <TableHead>Закуп. цена</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead className="text-right">Действие</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center h-24">Корзина пуста</TableCell>
                  </TableRow>
                ) : (
                  <>
                    {cart.map(item => {
                      const qty = item.qty || 0;
                      const price = typeof item.product.purchase_price !== 'undefined' ? Number(item.product.purchase_price) : 0;
                      const sum = qty * price;
                      return (
                        <TableRow key={item.product.id}>
                          <TableCell>{item.product.nomenclature_code || '-'}</TableCell>
                          <TableCell className="font-medium">{item.product.title}</TableCell>
                          {(() => {
  const freshProduct = products.find(p => p.id === item.product.id) || item.product;
  return <>
    <TableCell>{freshProduct.description || '-'}</TableCell>
    <TableCell>{freshProduct.category || '-'}</TableCell>
    <TableCell>{typeof freshProduct.selling_price !== 'undefined' ? freshProduct.selling_price : '-'}</TableCell>
    <TableCell>{freshProduct.unit || '-'}</TableCell>
  </>;
})()}
                          <TableCell>{qty}</TableCell>
                          <TableCell>{price || '-'}</TableCell>
                          <TableCell>{sum ? sum.toLocaleString() : '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.product.id)}>
                              Удалить
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {/* Итоговая сумма */}
                    <TableRow>
                      <TableCell colSpan={8} className="text-right font-bold">Итого:</TableCell>
                      <TableCell className="font-bold">
                        {cart.reduce((acc, item) => {
                          const qty = item.qty || 0;
                          const price = typeof item.product.purchase_price !== 'undefined' ? Number(item.product.purchase_price) : 0;
                          return acc + qty * price;
                        }, 0).toLocaleString()}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col space-y-4 p-4 border rounded-lg w-full max-w-xs">
              <h3 className="font-semibold">Поставщик</h3>
              <Select onValueChange={setSelectedSupplier} value={selectedSupplier || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите поставщика" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid gap-2">
                <label htmlFor="expected_delivery_date" className="font-semibold">Ожидаемая дата поставки</label>
                <Input
  type="date"
  id="expected_delivery_date"
  name="expected_delivery_date"
  required
  min={new Date().toISOString().split('T')[0]}
  value={expectedDeliveryDate}
  onChange={e => setExpectedDeliveryDate(e.target.value)}
  className="w-full"
/>
              </div>
              <Button
                onClick={() => handleCreateOrder(expectedDeliveryDate)}
                disabled={isCreating || !selectedSupplier || cart.length === 0 || !expectedDeliveryDate}
              >
                {isCreating ? 'Создание...' : 'Создать заказ'}
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
