import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ApplicationItem {
  name: string;
  qty: number;
  unit?: string;
  category?: string;
  comment?: string;
}

export interface ApplicationToCartDialogProps {
  trigger: React.ReactNode;
  initial: ApplicationItem;
  onSubmit: (item: RequiredProductFields) => void;
}

// Все обязательные поля для поставки
export interface RequiredProductFields {
  nomenclature_code: string;
  title: string;
  qty: number;
  unit: string;
  category: string;
  purchase_price: number;
}

export function ApplicationToCartDialog({ trigger, initial, onSubmit }: ApplicationToCartDialogProps) {
  const [fields, setFields] = useState<RequiredProductFields>({
    nomenclature_code: '',
    title: initial.name || '',
    qty: initial.qty || 1,
    unit: initial.unit || '',
    category: initial.category || '',
    purchase_price: 0,
  });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({
      ...prev,
      [name]: name === "qty" || name === "purchase_price" || name === "selling_price" ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    // Валидация обязательных полей
    if (!fields.nomenclature_code || !fields.title || !fields.unit || !fields.category || !fields.purchase_price) {
      setError("Заполните все обязательные поля: артикул, наименование, ед.изм., категория, закупочная цена");
      return;
    }
    setError(null);
    setOpen(false);
    onSubmit(fields);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Заполните данные для поставки</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="nomenclature_code">Артикул</Label>
          <Input name="nomenclature_code" value={fields.nomenclature_code} onChange={handleChange} required />
          <Label htmlFor="title">Наименование</Label>
          <Input name="title" value={fields.title} onChange={handleChange} required />
          <Label htmlFor="qty">Количество</Label>
          <Input name="qty" type="number" value={fields.qty} onChange={handleChange} required min={1} />
          <Label htmlFor="unit">Ед. изм.</Label>
          <Input name="unit" value={fields.unit} onChange={handleChange} required />
          <Label htmlFor="category">Категория</Label>
          <Input name="category" value={fields.category} onChange={handleChange} required />
          <Label htmlFor="purchase_price">Закупочная цена</Label>
          <Input name="purchase_price" type="number" value={fields.purchase_price} onChange={handleChange} required min={0} />
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Добавить в корзину</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
