import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export type WishlistItem = {
  name: string;
  qty: number;
  unit?: string;
  category?: string;
  comment?: string;
};

import { useEffect } from "react";

interface WishlistSectionProps {
  disabled?: boolean;
  onWishlistChange: (wishlist: WishlistItem[]) => void;
}

const WishlistSection: React.FC<WishlistSectionProps> = ({ disabled, onWishlistChange }) => {
  const [form, setForm] = useState<WishlistItem>({ name: '', qty: 1, unit: '', category: '', comment: '' });
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    onWishlistChange(wishlist);
  }, [wishlist, onWishlistChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'qty' ? Number(value) : value }));
  };

  const handleAdd = () => {
    if (!form.name || !form.qty) return;
    setWishlist((prev) => [...prev, form]);
    setForm({ name: '', qty: 1, unit: '', category: '', comment: '' });
  };

  const handleRemove = (idx: number) => {
    setWishlist((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-sm">Наименование *</label>
          <Input name="name" value={form.name} onChange={handleChange} placeholder="Название товара" required disabled={disabled} />
        </div>
        <div>
          <label className="block text-sm">Кол-во *</label>
          <Input name="qty" type="number" min={1} value={form.qty} onChange={handleChange} required disabled={disabled} />
        </div>
        <div>
          <label className="block text-sm">Ед. изм.</label>
          <Input name="unit" value={form.unit} onChange={handleChange} placeholder="шт/кг/л..." disabled={disabled} />
        </div>
        <div>
          <label className="block text-sm">Категория</label>
          <Input name="category" value={form.category} onChange={handleChange} placeholder="Категория" disabled={disabled} />
        </div>
        <div className="flex-1">
          <label className="block text-sm">Комментарий</label>
          <Input name="comment" value={form.comment} onChange={handleChange} placeholder="Комментарий" disabled={disabled} />
        </div>
        <Button type="button" onClick={handleAdd} className="h-10" disabled={disabled}>Добавить в хотелки</Button>
      </div>
      {wishlist.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Наименование</TableHead>
              <TableHead>Кол-во</TableHead>
              <TableHead>Ед. изм.</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Комментарий</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wishlist.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.qty}</TableCell>
                <TableCell>{item.unit || '-'}</TableCell>
                <TableCell>{item.category || '-'}</TableCell>
                <TableCell>{item.comment || '-'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(idx)}>Удалить</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default WishlistSection;
