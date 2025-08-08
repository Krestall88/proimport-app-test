'use client';

import { useState, useTransition } from 'react';
import { Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { deleteProduct, deleteProducts } from '@/app/manager/actions';



interface ProductTableProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  role: 'owner' | 'warehouse_manager' | 'agent';
  renderAddToCartColumn?: (product: Product) => React.ReactNode;
}

export default function ProductTable({ products, onProductsChange, role, renderAddToCartColumn }: ProductTableProps) {
  if (!Array.isArray(products)) products = [];

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editedData, setEditedData] = useState<Partial<Product>>({});
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [dialogState, setDialogState] = useState({ isOpen: false, productIds: [] as string[] });

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditedData(product);
  };

  const handleCancelClick = () => {
    setEditingProduct(null);
    setEditedData({});
  };

  const handleSaveClick = (productId: string) => {
    startTransition(async () => {
      // NOTE: This uses a client-side Supabase call, not a server action.
      // This is okay for updates, but deletes will use server actions for consistency.
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error } = await supabase.from('products').update(editedData).eq('id', productId);

      if (error) {
        toast.error(`Не удалось обновить товар: ${error.message}`);
        return;
      }

      const updatedProducts = products.map((p) => (p.id === productId ? { ...p, ...editedData } : p));
      onProductsChange(updatedProducts);
      toast.success('Товар успешно обновлен!');
      handleCancelClick();
    });
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    setSelectedRows(checked ? products.map(p => p.id) : []);
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const openDeleteDialog = (productIds: string[]) => {
    setDialogState({ isOpen: true, productIds });
  };

  const confirmDelete = () => {
    startTransition(async () => {
      const { productIds } = dialogState;
      const result = productIds.length > 1 
        ? await deleteProducts(productIds) 
        : await deleteProduct(productIds[0]);

      if (result.success) {
        toast.success(result.message);
        onProductsChange(products.filter(p => !productIds.includes(p.id)));
        setSelectedRows(prev => prev.filter(id => !productIds.includes(id)));
      } else {
        toast.error(result.message);
      }
    });
  };

  const renderEditableCell = (product: Product, field: keyof Product): React.ReactNode => {
    if (editingProduct?.id === product.id) {
      const value = editedData[field] ?? product[field];
      return (
        <Input
          value={value === null || typeof value === 'undefined' ? '' : String(value)}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full"
          type={field === 'purchase_price' || field === 'selling_price' ? 'number' : 'text'}
        />
      );
    }
    const value = product[field];
    if (value === null || typeof value === 'undefined') return null;
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  };

  const isOwner = role === 'owner';

  return (
    <div>
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, productIds: [] })}
        onConfirm={confirmDelete}
        title="Подтвердите удаление"
        description={`Вы уверены, что хотите удалить ${dialogState.productIds.length} товар(а/ов)? Это действие необратимо.`}
      />
      {isOwner && (
        <div className="mb-4">
          <Button
            onClick={() => openDeleteDialog(selectedRows)}
            disabled={selectedRows.length === 0 || isPending}
            variant="destructive"
          >
            Удалить выбранное ({selectedRows.length})
          </Button>
        </div>
      )}
      <div className="overflow-auto max-h-[600px] border rounded-lg bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              {isOwner && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.length > 0 && selectedRows.length === products.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Выбрать все"
                  />
                </TableHead>
              )}
              <TableHead>Артикул</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Описание</TableHead>
              {(isOwner || role === 'warehouse_manager') && <TableHead>Цена закупки</TableHead>}
              <TableHead>Цена продажи</TableHead>
              <TableHead>Ед. изм.</TableHead>
              <TableHead>Категория</TableHead>
              {isOwner && <TableHead>Действия</TableHead>}
              {renderAddToCartColumn && <TableHead>В корзину</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  {isOwner && (
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.includes(product.id)}
                        onCheckedChange={() => handleSelectRow(product.id)}
                        aria-label={`Выбрать строку ${product.id}`}
                      />
                    </TableCell>
                  )}
                  <TableCell>{renderEditableCell(product, 'nomenclature_code')}</TableCell>
                  <TableCell>{renderEditableCell(product, 'title')}</TableCell>
                  <TableCell>{renderEditableCell(product, 'description')}</TableCell>
                  {(isOwner || role === 'warehouse_manager') && (
                    <TableCell>{renderEditableCell(product, 'purchase_price')}</TableCell>
                  )}
                  <TableCell>{renderEditableCell(product, 'selling_price')}</TableCell>
                  <TableCell>{renderEditableCell(product, 'unit')}</TableCell>
                  <TableCell>{renderEditableCell(product, 'category')}</TableCell>
                  {isOwner && (
                    <TableCell>
                      {editingProduct?.id === product.id ? (
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleSaveClick(product.id)} disabled={isPending}>Сохранить</Button>
                          <Button variant="ghost" size="sm" onClick={handleCancelClick}>Отмена</Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditClick(product)} disabled={isPending}>✎</Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog([product.id])} disabled={isPending}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                  {renderAddToCartColumn && (
                    <TableCell>{renderAddToCartColumn(product)}</TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isOwner ? 9 : (renderAddToCartColumn ? 8 : 7)} className="text-center text-gray-400 py-8">
                  Нет товаров для отображения
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
