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
import type { WishlistItem } from "@/lib/types/inventory";

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

interface CartItem extends InventoryProduct {
  quantity: number;
}

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
      acc[item.product_id] = (acc[item.product_id] || 0) + item.available_quantity;
      return acc;
    }, {} as { [key: string]: number });

    const result = inventory
      .map(p => ({
        ...p,
        available_quantity: p.available_quantity - (cartQtys[p.product_id] || 0),
      }))
      .filter(p => p.available_quantity > 0 && 
        ((p.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || 
         (p.sku ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
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

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product_id === product.product_id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.available_quantity + quantity }
            : item
        );
      } else {
        // Убедимся, что final_price не будет undefined
        const price = product.final_price ?? 0;
        return [...prevCart, { ...product, quantity, final_price: price }];
      }
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(cart.map(item => item.product_id === productId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedCustomerId) {
      toast.error("Пожалуйста, выберите клиента");
      return;
    }

    if (cart.length === 0) {
      toast.error("Корзина не может быть пустой");
      return;
    }

    startTransition(async () => {
      try {
        // DEBUG: Проверим, что передается в cart
        console.log('DEBUG: Sending cart to server action:', cart);
        
        // Проверяем, что все элементы корзины имеют корректную цену
        const validatedCart = cart.map(item => ({
          product_id: item.product_id,
          qty: item.available_quantity,
          final_price: (item.final_price !== undefined && !isNaN(item.final_price)) ? item.final_price : 0,
        }));
        
        console.log('DEBUG: Validated cart:', validatedCart);
        
        const result = await createCustomerOrders({
          customerId: selectedCustomerId,
          cart: validatedCart,
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

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.final_price * item.available_quantity), 0);
  }, [cart]);

  const handleWishlistChange = (newWishlist: WishlistItem[]) => {
    setWishlist(newWishlist);
  };

  const handleAddWishlistToCart = (item: WishlistItem) => {
    // Найти соответствующий товар в инвентаре
    const product = displayInventory.find(p => p.title === (item.title || item.title));
    if (product) {
      const quantity = item.qty || 1;
      if (quantity <= product.available_quantity) {
        const cartItem: CartItem = { 
          ...product, 
          quantity,
          final_price: product.final_price || 0
        };
        handleAddToCart(cartItem);
      } else {
        toast.error(`Недостаточно товара ${item.title || item.title} в наличии`);
      }
    } else {
      toast.error(`Товар ${item.title || item.title} не найден в остатках`);
    }
  };

  const handleRemoveFromWishlist = (title: string) => {
    setWishlist(prev => prev.filter(item => (item.title || item.title) !== title));
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
      <div className="mb-6">
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Остатки товаров</h2>
          <div className="mb-4">
            <Input
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Наименование</TableHead>
                  <TableHead className="w-[250px]">Описание</TableHead>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Партия</TableHead>
                  <TableHead>Срок годности</TableHead>
                  <TableHead className="text-right">Цена, сом</TableHead>
                  <TableHead className="text-right">Остаток</TableHead>
                  <TableHead className="text-center">Кол-во</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayInventory.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{product.description}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.batch_number || '-'}</TableCell>
                    <TableCell>{product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.final_price)}</TableCell>
                    <TableCell className="text-right">{product.available_quantity} {product.unit}</TableCell>
                    <TableCell className="min-w-[120px]">
                      <Input
                        type="number"
                        min="1"
                        max={product.available_quantity}
                        value={qtyById[product.product_id] || 1}
                        onChange={(e) => setQtyById({ ...qtyById, [product.product_id]: parseInt(e.target.value, 10) })}
                        className="w-32"
                        style={{ minWidth: 120 }}
                        disabled={product.available_quantity <= 0}
                      />
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
                  <TableHead>Наименование</TableHead>
                  <TableHead className="text-right">Количество</TableHead>
                  <TableHead className="text-right">Цена</TableHead>
                  <TableHead className="text-right">Итого</TableHead>
                  <TableHead className="text-center">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.product_id}>
                    <TableCell className="font-medium">{item.title || item.title}</TableCell>
                    <TableCell className="text-right">{item.available_quantity} {item.unit}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.final_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.final_price * item.available_quantity)}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveFromCart(item.product_id)}>Удалить</Button>
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
                <span>{formatCurrency(cart.reduce((acc, item) => acc + item.final_price * item.available_quantity, 0))}</span>
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
          onWishlistChange={handleWishlistChange}
          inventory={inventory}
        />
      </div>
    </div>
  );
}