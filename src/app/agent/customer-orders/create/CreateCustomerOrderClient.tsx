'use client';

import { useState, useEffect, useMemo, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createCustomerOrders } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import WishlistSection from "./WishlistSection";
import type { ApplicationItem as WishlistItem } from "@/lib/types/inventory";

import type { InventoryProduct } from "@/lib/types/inventory";

interface Customer {
  id: string;
  name: string;
  contacts: {
    phone?: string | null;
    email?: string | null;
  } | null;
  tin?: string;
  kpp?: string;
  delivery_address?: string;
  payment_terms?: string;
}

type CartItem = { product: InventoryProduct; qty: number };

// Используем общий тип WishlistItem из @/lib/types/inventory

interface CreateCustomerOrderClientProps {
  inventory: InventoryProduct[];
}

export default function CreateCustomerOrderClient({ inventory }: CreateCustomerOrderClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [qtyById, setQtyById] = useState<{ [productId: string]: number }>({});

  useEffect(() => {
    const supabase = createClient();

    async function loadCustomers() {
      const { data: cust } = await supabase.from("customers").select("id, name, contacts, tin, kpp, delivery_address, payment_terms");
      if (cust) {
        // Ensure contacts is object or null, never a string
        setCustomers(
          cust.map((c) => ({
            ...c,
            contacts:
              typeof c.contacts === 'string'
                ? (() => { try { return JSON.parse(c.contacts); } catch { return null; } })()
                : (c.contacts ?? null),
            tin: c.tin === null ? undefined : c.tin,
            kpp: c.kpp === null ? undefined : c.kpp,
            delivery_address: c.delivery_address === null ? undefined : c.delivery_address,
            payment_terms: c.payment_terms === null ? undefined : c.payment_terms,
          }))
        );
      } else {
        setCustomers([]);
      }
    }

    loadCustomers();
  }, []);

  useEffect(() => {
    if (inventory.length > 0) {
      const initialQtys = Object.fromEntries(
        inventory.map((p) => [p.product_id, 1])
      );
      setQtyById(initialQtys);
    }
  }, [inventory]);

  const displayInventory = useMemo(() => {
    const cartQtys: { [key: string]: number } = cart.reduce((acc, item) => {
      acc[item.product.product_id] = (acc[item.product.product_id] || 0) + item.qty;
      return acc;
    }, {} as { [key: string]: number });

    const result = inventory
      .map(p => ({
        ...p,
        available_quantity: p.available_quantity - (cartQtys[p.product_id] || 0),
      }))
      .filter(p => p.available_quantity > 0 && 
        ((p.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || 
         (p.nomenclature_code ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
      );
    
    // DEBUG: Проверим, приходят ли данные с final_price
    console.log('DEBUG: displayInventory items', result);
    
    return result;
  }, [inventory, cart, searchTerm]);

  const handleAddToCart = (product: InventoryProduct) => {
    const quantity = qtyById[product.product_id] || 1;
    if (quantity <= 0) {
      toast.error("Количество должно быть больше нуля");
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.product_id === product.product_id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.product_id === product.product_id ? { ...item, qty: item.qty + quantity } : item
        );
      } else {
        return [...prevCart, { product, qty: quantity }];
      }
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.product_id !== productId));
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    const productInInventory = inventory.find(p => p.product_id === productId);
    if (!productInInventory) return;

    if (newQuantity < 1) {
      toast.info("Количество не может быть меньше 1. Для удаления используйте кнопку.");
      // Не меняем значение, если оно некорректно
      return; 
    }

    if (newQuantity > productInInventory.available_quantity) {
      toast.error(`Недостаточно остатков. Доступно: ${productInInventory.available_quantity}`);
      // Устанавливаем максимально доступное значение
      newQuantity = productInInventory.available_quantity;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.product_id === productId ? { ...item, qty: newQuantity } : item
      )
    );
  };

  const handleCreateOrder = () => {
    if (!selectedCustomerId) {
      toast.error("Пожалуйста, выберите клиента.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Корзина пуста.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createCustomerOrders({
          customerId: selectedCustomerId,
          cart: cart.map(item => ({
            product_id: item.product.product_id,
            qty: item.qty,
            final_price: item.product.final_price,
            product_name: item.product.title,
          })),
          wishlist: wishlist,
        });

        if (result.success) {
          toast.success(result.message);
          setCart([]);
          setWishlist([]);
          router.push("/agent/customer-orders");
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("Произошла непредвиденная ошибка");
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KGS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="p-4 w-full space-y-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Создание нового заказа клиента</h1>
      
      {/* Выбор клиента в левом углу */}
      <div className="mb-6">
        <div className="w-full max-w-lg">
          <h2 className="text-lg font-semibold mb-3">Выбор клиента</h2>
          <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите клиента" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="py-1">
                    <div className="font-medium">{customer.name}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Остатки и корзина */}
      <div className="grid grid-cols-1 gap-8">
        {/* Левая колонка: Остатки */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Доступные товары</h2>
          <Input
            placeholder="Поиск по названию или артикулу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 max-w-sm"
          />
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Номер партии</TableHead>
                  <TableHead className="text-right">Цена</TableHead>
                  <TableHead className="text-right">Остаток</TableHead>
                  <TableHead>Количество</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayInventory.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell>{product.nomenclature_code}</TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>{product.batch_number}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.final_price)}</TableCell>
                    <TableCell className="text-right">{product.available_quantity} {product.unit}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Input
                          type="number"
                          value={qtyById[product.product_id] || 1}
                          onChange={(e) =>
                            setQtyById({
                              ...qtyById,
                              [product.product_id]: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-28 text-right"
                          min="1"
                          max={product.available_quantity}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.available_quantity <= 0}
                        size="sm"
                      >
                        В корзину
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Корзина под остатками */}
      <div className="w-full mt-8">
        <h3 className="text-lg font-semibold mb-4">Корзина</h3>
        {cart.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
            <p>Корзина пуста</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead className="text-right">Количество</TableHead>
                  <TableHead className="text-right">Цена</TableHead>
                  <TableHead className="text-right">Итого</TableHead>
                  <TableHead className="text-center">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.product.product_id}>
                    <TableCell>{item.product.nomenclature_code}</TableCell>
                    <TableCell className="font-medium">{item.product.title}</TableCell>
                    <TableCell>{item.product.description}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleUpdateCartQuantity(item.product.product_id, parseInt(e.target.value, 10) || 0)}
                          className="w-28 text-right"
                          min="1"
                          max={inventory.find(p => p.product_id === item.product.product_id)?.available_quantity ?? item.qty}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.product.final_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.product.final_price * item.qty)}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveFromCart(item.product.product_id)}>Удалить</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {cart.length > 0 && (
          <div>
            <div className="pt-4 mt-4 border-t">
              <div className="flex justify-between font-bold">
                <span>Итого</span>
                <span>{formatCurrency(cart.reduce((acc, item) => acc + item.product.final_price * item.qty, 0))}</span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleCreateOrder}
                disabled={!selectedCustomerId || cart.length === 0 || isPending}
              >
                {isPending ? "Создание..." : "Создать заказ"}
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="w-full mt-6">
        {/* Хотелки под корзиной */}
        <WishlistSection
          disabled={!selectedCustomerId}
          onWishlistChange={setWishlist}
          
          inventory={inventory}
        />
      </div>
    </div>
  );
}