"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { WishlistToCartDialog, RequiredProductFields } from "@/components/WishlistToCartDialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Типы для wishlist
interface WishlistItem {
  id: string;
  customer_id: string;
  agent_id: string;
  wishlist_items: {
    name: string;
    qty: number;
    unit?: string;
    category?: string;
    comment?: string;
  }[];
  created_at: string;
  updated_at: string;
  customer: { 
    name: string;
    contacts: {
      phone?: string | null;
      email?: string | null;
    } | null;
    tin?: string;
    kpp?: string;
    delivery_address?: string;
    payment_terms?: string;
  };
  agent: { full_name: string | null };
}

export default function ManagerWishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const router = useRouter();

  // Загрузка всех wishlist-позиций для руководителя
  useEffect(() => {
    async function fetchWishlist() {
      const res = await fetch("/api/manager/wishlist");
      const data = await res.json();
      setWishlist(data);
    }
    fetchWishlist();
  }, []);

  // Проверить, есть ли позиция в корзине руководителя
  const isInManagerCart = (subItem: { name: string; qty: number; unit?: string; category?: string; comment?: string }) => {
    try {
      const managerCart = JSON.parse(localStorage.getItem('managerPurchaseOrderCart') || '[]');
      return managerCart.some((item: any) => item.title === subItem.name && item.quantity === subItem.qty);
    } catch {
      return false;
    }
  };

  // Добавить позицию в корзину руководителя через создание продукта
  const addToPurchaseOrder = async (fields: RequiredProductFields) => {
    try {
      const res = await fetch('/api/manager/create-product-from-wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      const result = await res.json();
      if (result.error || !result.product) {
        toast.error(`Ошибка при создании товара из хотелки: ${result.error?.message || 'Неизвестная ошибка'}`);
        return;
      }
      // Добавляем в корзину руководителя
      const managerCart = JSON.parse(localStorage.getItem('managerPurchaseOrderCart') || '[]');
      const newItem = {
        ...result.product,
        quantity: fields.qty,
        fromWishlist: true
      };
      localStorage.setItem('managerPurchaseOrderCart', JSON.stringify([...managerCart, newItem]));
      // Генерируем customEvent для синхронизации корзины в других компонентах
      window.dispatchEvent(new CustomEvent('managerCartUpdated'));
      toast.success(`Товар "${fields.title}" добавлен в корзину поставки`);
    } catch (e) {
      toast.error('Ошибка при добавлении товара из хотелки');
    }
  };



  // Перейти к созданию поставки
  const goToPurchaseOrder = () => {
    router.push('/manager/create-purchase-order');
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold mb-4">Дополнительные заказы (Хотелки клиентов)</h1>
      <div className="space-y-6">
        {wishlist.map((wishlistGroup) => (
          <div key={wishlistGroup.id} className="border rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                Хотелки для клиента: {wishlistGroup.customer.name}
              </h3>
              <div className="text-sm text-gray-600">
                <p>Агент: {wishlistGroup.agent.full_name || 'Не указан'} | 
                Создано: {new Date(wishlistGroup.created_at).toLocaleDateString()}</p>
                <div className="mt-1">
                  {wishlistGroup.customer.contacts?.phone && <p>Тел: {wishlistGroup.customer.contacts.phone}</p>}
                  {wishlistGroup.customer.contacts?.email && <p>Email: {wishlistGroup.customer.contacts.email}</p>}
                  {wishlistGroup.customer.tin && <p>ИНН: {wishlistGroup.customer.tin}</p>}
                  {wishlistGroup.customer.kpp && <p>КПП: {wishlistGroup.customer.kpp}</p>}
                  {wishlistGroup.customer.delivery_address && <p>Адрес доставки: {wishlistGroup.customer.delivery_address}</p>}
                  {wishlistGroup.customer.payment_terms && <p>Условия оплаты: {wishlistGroup.customer.payment_terms}</p>}
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Кол-во</TableHead>
                  <TableHead>Ед. изм.</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Комментарий</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wishlistGroup.wishlist_items.map((subItem, idx) => {
  const used = isInManagerCart(subItem);
  return (
    <TableRow key={idx} className={used ? 'opacity-60 bg-gray-100' : ''}>
      <TableCell>{subItem.name}</TableCell>
      <TableCell>{subItem.qty}</TableCell>
      <TableCell>{subItem.unit || "-"}</TableCell>
      <TableCell>{subItem.category || "-"}</TableCell>
      <TableCell>{subItem.comment || "-"}</TableCell>
      <TableCell>
        {used ? (
          <span className="text-green-700 font-semibold">Использовано в заказе</span>
        ) : (
          <WishlistToCartDialog
            trigger={<Button size="sm">Добавить в поставку</Button>}
            initial={subItem}
            onSubmit={addToPurchaseOrder}
          />
        )}
      </TableCell>
    </TableRow>
  );
})}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>

      {/* Действия */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Управление поставками</h2>
        <p className="text-sm text-gray-600 mb-4">
          Позиции из хотелок добавляются в общую корзину поставки. 
          Перейдите на страницу создания поставки, чтобы продолжить оформление.
        </p>
        <Button onClick={goToPurchaseOrder} className="w-full">
          Перейти к созданию поставки
        </Button>
      </div>
    </div>
  );
}
