'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Supplier } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateProductDialog, NewProduct } from '@/components/CreateProductDialog';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type CartItem = { product: Product; qty: number; editing: boolean };

interface Props {
  products: Product[];
}

export default function CreatePurchaseOrderClient({ products }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]); // глобальный тип Supplier
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchSuppliers = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('suppliers').select('id, name');
      if (error) {
        toast.error('Не удалось загрузить список поставщиков.');
        console.error('Error fetching suppliers:', error);
      } else if (data) {
        setSuppliers((data ?? []).map((s: any) => ({
          ...s,
          contacts: typeof s.contacts === 'object' && s.contacts !== null ? s.contacts : { phone: null, email: null }
        })) as Supplier[]);
      }
    };
    fetchSuppliers();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return allProducts;
    return allProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProducts, searchTerm]);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.product.id === p.id);
      if (existing) {
        toast.info(`${p.title} уже в корзине.`);
        return prev;
      }
      toast.success(`${p.title} добавлен в корзину.`);
      return [...prev, { product: p, qty: 1, editing: false }];
    });
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setCart((prev) => 
      prev.map((item) => 
        item.product.id === product.id ? { ...item, editing: true } : item
      )
    );
  };

  const stopEditing = () => {
    setEditingProduct(null);
    setCart((prev) => 
      prev.map((item) => ({ ...item, editing: false }))
    );
  };

  const updateProductField = async (productId: string, field: keyof Product, value: any) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('products')
      .update({ [field]: value })
      .eq('id', productId);

    if (error) {
      toast.error('Ошибка при обновлении товара:', { description: error.message });
      return;
    }

    // Обновляем все места, где используется этот товар
    setCart((prev) => 
      prev.map((item) => 
        item.product.id === productId ? { ...item, product: { ...item.product, [field]: value } } : item
      )
    );
    setAllProducts((prev) => 
      prev.map((p) => 
        p.id === productId ? { ...p, [field]: value } : p
      )
    );

    toast.success('Товар успешно обновлен!');
    stopEditing();
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((ci) => (ci.product.id === id ? { ...ci, qty } : ci))
    );
  };

  const remove = (id: string) => {
    setCart((prev) => prev.filter((ci) => ci.product.id !== id));
  };

  const submit = async () => {
    if (!expectedDeliveryDate) {
      toast.error('Укажите ожидаемую дату поставки');
      return;
    }
    if (cart.length === 0) {
      toast.error('Корзина пуста. Добавьте товары для создания заказа.');
      return;
    }
    if (!selectedSupplier) {
      toast.error('Пожалуйста, выберите поставщика.');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.functions.invoke('create_purchase_orders', {
      body: {
        items: cart.map((ci) => ({ product_id: ci.product.id, qty: ci.qty })),
        supplier_id: selectedSupplier,
      },
    });

    if (error) {
      toast.error('Ошибка при создании заказа:', { description: error.message });
    } else {
      toast.success('Заказ на поставку успешно создан!');
      router.push('/manager'); // Redirect to manager dashboard or a success page
    }
  };

  const handleProductCreated = (newProduct: NewProduct) => {
    const product: Product = {
      id: newProduct.id,
      title: newProduct.title,
      sku: newProduct.sku ?? newProduct.nomenclature_code ?? '',
      description: newProduct.description ?? '',
      purchase_price: newProduct.purchase_price ?? 0,
      selling_price: newProduct.selling_price ?? 0,
      category: newProduct.category ?? null,
      unit: newProduct.unit ?? null,
      batch_number: newProduct.batch_number ?? '',
      expiry_date: newProduct.expiry_date ?? '',
    };
    setAllProducts((prevProducts) => [...prevProducts, product]);
    // Сразу добавляем новый товар в корзину
    addToCart(product);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Номенклатура</CardTitle>
            <CreateProductDialog onProductCreated={handleProductCreated} />
          </div>
          <Input
            placeholder="Поиск по названию или артикулу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-2"
          />
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Наименование</TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => addToCart(p)}>
                      Добавить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Корзина</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p className="text-muted-foreground">Корзина пуста</p>
          ) : (
            <div className="space-y-4">
              {cart.map((ci) => (
                <div key={ci.product.id} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{ci.product.title}</p>
                        <p className="text-xs text-muted-foreground">{ci.product.sku}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => startEditing(ci.product)}
                          disabled={ci.editing}
                        >
                          ✎
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={ci.qty}
                          onChange={(e) => updateQty(ci.product.id, Number(e.target.value))}
                          className="w-20 h-9"
                        />
                        <Button variant="destructive" size="icon" onClick={() => remove(ci.product.id)}>
                          ✕
                        </Button>
                      </div>
                    </div>
                    {ci.editing && (
                      <div className="mt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`title-${ci.product.id}`}>Название</Label>
                            <Input
                              id={`title-${ci.product.id}`}
                              value={ci.product.title}
                              onChange={(e) => updateProductField(ci.product.id, 'title', e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`sku-${ci.product.id}`}>Артикул</Label>
                            <Input
                              id={`sku-${ci.product.id}`}
                              value={ci.product.sku}
                              onChange={(e) => updateProductField(ci.product.id, 'sku', e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`batch_number-${ci.product.id}`}>Партия</Label>
                            <Input
                              id={`batch_number-${ci.product.id}`}
                              value={ci.product.batch_number}
                              onChange={(e) => updateProductField(ci.product.id, 'batch_number', e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`expiry_date-${ci.product.id}`}>Срок годности</Label>
                            <Input
                              id={`expiry_date-${ci.product.id}`}
                              type="date"
                              value={ci.product.expiry_date}
                              onChange={(e) => updateProductField(ci.product.id, 'expiry_date', e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`purchase_price-${ci.product.id}`}>Закупочная цена</Label>
                            <Input
                              id={`purchase_price-${ci.product.id}`}
                              type="number"
                              value={ci.product.purchase_price?.toString() || ''}
                              onChange={(e) => updateProductField(ci.product.id, 'purchase_price', parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="supplier">Поставщик</Label>
              <Select onValueChange={setSelectedSupplier} value={selectedSupplier ?? undefined}>
                <SelectTrigger id="supplier" className="w-full">
                  <SelectValue placeholder="Выберите поставщика" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expected_delivery_date">Ожидаемая дата поставки</Label>
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
            <Button disabled={cart.length === 0 || !selectedSupplier || !expectedDeliveryDate} onClick={submit} className="w-full">
              Отправить заявку
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
