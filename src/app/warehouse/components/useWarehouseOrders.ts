import { useEffect, useState } from "react";

export function useWarehouseOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let active = true;
    async function fetchOrders() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/warehouse-orders");
        const data = await res.json();
        if (active) {
          setOrders(data || []);
          setError(null);
        }
      } catch (e) {
        if (active) setError(e);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return { orders, isLoading, error };
}
