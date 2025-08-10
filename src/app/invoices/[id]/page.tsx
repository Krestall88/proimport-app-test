import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Invoice } from '@/lib/types';

import { formatCurrency } from '@/app/utils/formatCurrency';
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');

// Define local types for the data we're fetching
interface Customer {
  name: string;
  address: string;
  contacts: {
    phone?: string | null;
  } | null;
}

import { Product } from '@/lib/types';

interface OrderItem {
  quantity: number;
  price_per_unit: number;
  product: Product;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  customer: Customer | null;
  customer_order_items: OrderItem[];
  invoice_number?: string;
  issue_date?: string;
  due_date?: string;
}

const InvoicePage = async function (props: any) {
  const { params } = props;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from('customer_orders')
    .select(`
      id, 
      created_at, 
      status, 
      customer:customers (name, address, contacts),
      customer_order_items(quantity, price_per_unit, product:products(title))
    `)
    .eq('id', params.id)
    .single();

  if (error || !order) {
    console.error(error);
    notFound();
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-black p-8 rounded-lg shadow-lg print:shadow-none print:bg-transparent print:p-0">
        <div className="flex justify-between items-center mb-8 pb-4 border-b">
            <div>
                <h1 className="text-3xl font-bold">Счет-фактура</h1>
                <p className="text-gray-600">ProImport</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg">{(order as any).invoice_number}</p>
                <p>Дата выставления: {formatDate((order as any).issue_date || '')}</p>
                <p>Оплатить до: {formatDate((order as any).due_date || '')}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
                <h2 className="font-semibold mb-2">Поставщик:</h2>
                <p>{(order as any).supplier?.name}</p>
            </div>
            <div className="text-right">
                <h2 className="font-semibold mb-2">Клиент:</h2>
                <p>{(order as any).customer?.name}</p>
                <p>{(order as any).customer?.address}</p>
                <p>{(order as any).customer?.contacts?.phone}</p>
            </div>
        </div>

        <h2 className="font-semibold mb-4 text-lg">Детали заказа:</h2>
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-2 text-left">Описание</th>
              <th className="p-2 text-right">Кол-во</th>
              <th className="p-2 text-right">Цена за шт.</th>
              <th className="p-2 text-right">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {(order as any).customer_order_items.map((item: any, index: number) => {
              const total = item.quantity * item.price_per_unit;
              return (
                <tr key={index} className="border-b border-gray-700 last:border-b-0">
                  <td className="p-2">{item.product.title}</td>
                  <td className="p-2 text-right">{item.quantity}</td>
                  <td className="p-2 text-right">{formatCurrency(item.price_per_unit)}</td>
                  <td className="p-2 text-right">{formatCurrency(total)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="mt-4 text-right">
          <p className="text-lg font-semibold">Итого: {formatCurrency((order as any).customer_order_items.reduce((acc: number, item: any) => acc + item.quantity * item.price_per_unit, 0))}</p>
        </div>

        <div className="mt-12 text-center print:hidden">
          <Link href="/" className="text-gray-600 hover:underline mr-4">На главную</Link>
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Печать
          </button>
        </div>
    </div>
  );
}

export default InvoicePage;