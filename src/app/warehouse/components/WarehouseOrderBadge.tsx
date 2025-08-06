"use client";

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function WarehouseOrderBadge() {
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const supabase = createClient();
        
        // Подсчитываем количество заказов со статусом 'new' или 'picking'
        const { count, error } = await supabase
          .from('customer_orders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['new', 'picking']);

        if (error) {
          console.error('Error fetching order count:', error);
          setOrderCount(0);
        } else {
          setOrderCount(count || 0);
        }
      } catch (err) {
        console.error('Error fetching order count:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderCount();
  }, []);

  if (loading) {
    return <Badge variant="secondary">Загрузка...</Badge>;
  }

  if (orderCount === 0) {
    return null;
  }

  return (
    <Badge variant="destructive" className="ml-2">
      {orderCount}
    </Badge>
  );
}