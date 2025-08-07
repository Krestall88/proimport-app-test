'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Database } from '@/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface CreateProductModalProps {
  onProductCreated?: (newProduct: Product, quantity: number) => void;
}

export default function CreateProductModal({ onProductCreated }: CreateProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nomenclature_code, setNomenclatureCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          nomenclature_code,
          title,
          description,
          purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
          selling_price: sellingPrice ? parseFloat(sellingPrice) : null,
          unit,
          category,
        },
      ])
      .select().single();

    setIsSubmitting(false);

    if (error) {
      toast.error('Ошибка при создании товара:', { description: error.message });
    } else {
      toast.success('Товар успешно создан!');
      if (data) {
        onProductCreated?.(data, parseInt(quantity, 10) || 1);
      }
      setIsOpen(false);
      // Reset form
      setNomenclatureCode('');
      setTitle('');
      setDescription('');
      setPurchasePrice('');
      setSellingPrice('');
      setUnit('');
      setCategory('');
      setQuantity('1');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Добавить товар</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать новый товар</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nomenclature_code">Артикул</Label>
            <Input id="nomenclature_code" value={nomenclature_code} onChange={(e) => setNomenclatureCode(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="title">Название</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="description">Описание</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="purchasePrice">Цена закупки</Label>
            <Input id="purchasePrice" type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sellingPrice">Цена продажи</Label>
            <Input id="sellingPrice" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="unit">Ед. изм.</Label>
            <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="category">Категория</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="quantity">Количество</Label>
            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" required />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Создание...' : 'Создать'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
