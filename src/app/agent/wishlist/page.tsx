"use client";
import { useEffect, useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

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

export default function AgentWishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    async function fetchWishlist() {
      const res = await fetch("/api/agent/wishlist");
      const data = await res.json();
      setWishlist(data);
    }
    fetchWishlist();
  }, []);

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold mb-4">Ваши хотелки клиентов</h1>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {wishlistGroup.wishlist_items.map((subItem, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{subItem.name}</TableCell>
                    <TableCell>{subItem.qty}</TableCell>
                    <TableCell>{subItem.unit || "-"}</TableCell>
                    <TableCell>{subItem.category || "-"}</TableCell>
                    <TableCell>{subItem.comment || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Информация</h2>
        <p className="text-sm text-gray-600 mb-4">
          Здесь отображаются все хотелки ваших клиентов. Вы не можете их редактировать, но можете просматривать историю для будущих заказов.
        </p>
      </div>
    </div>
  );
}
