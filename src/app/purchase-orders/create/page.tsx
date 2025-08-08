'use client';

import { useState, useEffect } from 'react';
import { createPurchaseOrder } from '@/app/purchase-orders/actions';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

import { Product } from '@/lib/types';
type Supplier = { id: string; name: string };

export default function CreatePurchaseOrderPage() {
  const [orderType, setOrderType] = useState<'existing' | 'new'>('existing');
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [price, setPrice] = useState<string>('');

  useEffect(() => {
    const supabase = createClient();
    async function fetchData() {
      const { data: productsData } = await supabase.from('products').select('id, title, purchase_price');
      const { data: suppliersData } = await supabase.from('suppliers').select('id, name');
      if (productsData) setProducts((productsData as any[]).map(p => ({ ...p, description: p.description ?? '' })) as Product[]);
      if (suppliersData) setSuppliers(suppliersData as Supplier[]);
    }
    fetchData();
  }, []);

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    if (product && product.purchase_price) {
      setPrice(String(product.purchase_price));
    } else {
      setPrice('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Создать закупочный заказ</h3>
        <p className="text-sm text-muted-foreground">
          Выберите существующий товар или добавьте новый.
        </p>
      </div>

      <form action={createPurchaseOrder} className="space-y-8">
        <input type="hidden" name="orderType" value={orderType} />

        <RadioGroup defaultValue="existing" onValueChange={(value: string) => setOrderType(value as 'existing' | 'new')}>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="r1" />
                <Label htmlFor="r1">Выбрать существующий товар</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="r2" />
                <Label htmlFor="r2">Добавить новый товар</Label>
            </div>
        </RadioGroup>

        {orderType === 'existing' ? (
          <div className="space-y-4">
            <Label>Товар</Label>
            <Select name="product_id" onValueChange={handleProductChange} required>
                <SelectTrigger>
                    <SelectValue placeholder="Выберите товар из списка" />
                </SelectTrigger>
                <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-4 p-4 border rounded-md">
            <h4 className="font-semibold">Новый товар</h4>
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Название *</Label><Input name="new_product_title" placeholder="Например, 'Кофе в зернах Арабика'" required /></div>
                <div><Label>Артикул *</Label><Input name="new_product_sku" placeholder="Например, 'COF-AR-1KG'" required /></div>
            </div>
            <div><Label>Описание</Label><Input name="new_product_description" placeholder="Краткое описание товара" /></div>
            <div className="grid grid-cols-3 gap-4">
                <div><Label>Ед. изм.</Label><Input name="new_product_unit" placeholder="шт / кг / л" /></div>
                <div><Label>Категория</Label><Input name="new_product_category" placeholder="Напитки" /></div>
                <div><Label>Закупочная цена</Label><Input name="new_product_purchase_price" type="number" placeholder="Цена для карточки товара" /></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
            <div>
                <Label>Поставщик *</Label>
                <Select name="supplier_id" required>
                    <SelectTrigger><SelectValue placeholder="Выберите поставщика" /></SelectTrigger>
                    <SelectContent>
                        {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Количество *</Label>
                <Input name="quantity" type="number" min="1" required />
            </div>
            <div>
                <Label>Цена за единицу (в заказе) *</Label>
                <Input name="price_per_unit" type="number" value={price} onChange={e => setPrice(e.target.value)} min="0.01" step="0.01" required />
            </div>
        </div>

        <Button type="submit" className="w-full">Создать заказ</Button>
      </form>
    </div>
  );
}
