export type Role = 'owner' | 'agent' | 'warehouse_manager' | 'driver' | 'accountant';




export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  contact_person: string;
  contacts: {
    phone?: string | null;
    email?: string | null;
  } | null;
}

export interface Customer {
  id: string;
  name: string;
  address?: string | null;
  contacts: {
    phone?: string | null;
    email?: string | null;
  } | null;
  tin?: string | null; // ИНН
  kpp?: string | null; // КПП
  delivery_address?: string | null; // Адрес доставки
  payment_terms?: string | null; // Условия оплаты
  comments?: string | null; // Комментарии
  created_at: string;
  bank_details?: {
    bank_name?: string | null;
    bic?: string | null;
    account_number?: string | null;
  } | null;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string; // опционально, если в БД нет такого поля
  contacts: {
    phone?: string | null;
    email?: string | null;
  } | null;
  tin?: string | null;
}


export interface Product {
  id: string;
  title: string; // Наименование
  nomenclature_code: string; // Артикул/код (единый идентификатор)
  description: string | null;
  purchase_price: number | null;
  selling_price: number | null;
  category: string | null;
  unit: string | null;
  expiry_date?: string | null;
  batch_number?: string | null;
  created_at: string;
  supplier_id: string | null;
  characteristics?: any;
  available_quantity?: number;
  // sku убран как основной идентификатор, используйте nomenclature_code
}


//==============================================================================
// SCM (Supply Chain Management) Types - Warehouse Operations
//==============================================================================

// --- Purchase Orders ---

export type PurchaseOrderStatus = 'pending' | 'completed' | 'cancelled' | 'ordered' | 'in_transit' | 'received';

export type ProductInfo = {
  nomenclature_code: string;
  title: string;
  unit: string;
  description?: string | null;
  category?: string | null;
};

export type PurchaseOrderItem = {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity_ordered: number;
  price_per_unit?: number;
  product?: Product | null; // join по product_id (унифицированный тип)
};

export type PurchaseOrder = {
  id: string;
  expected_delivery_date: string | null;
  status: string;
  supplier_id: string;
  supplier?: Supplier | null; // join по supplier_id
  purchase_order_items: PurchaseOrderItem[];
};

// --- Goods Receipts ---

// --- Batch Inventory Aggregation ---
export interface BatchInventoryItem {
  id?: string;
  product_id: string;
  product: Product; // Используем единый тип Product с расширенным набором полей
  available_quantity: number;
  purchase_price?: number;
  final_price?: number;
  total_received?: number;
  total_reserved?: number;
  characteristics?: any;
}


export type GoodsReceiptStatus = 'in_progress' | 'completed';


// --- Inventory ---

export interface InventoryItem {
  id?: string;
  product_id: string;
  product: Product; // Используем единый тип Product с расширенным набором полей
  available_quantity: number;
  purchase_price?: number;
  final_price?: number;
  total_received?: number;
  total_reserved?: number;
  characteristics?: any;
  location?: string | null;
}

// --- Types for Detailed Receiving Page ---
// (определения интерфейсов для детальной страницы приёмки должны быть здесь, если нужны)

//==============================================================================
// Manager Module Types
//==============================================================================

export interface ManagerInventoryItem {
  id: string;
  product_id: string;
  product: Product; // Используем единый тип Product с расширенным набором полей
  available_quantity: number;
  purchase_price: number;
  final_price: number;
  total_received?: number;
  total_reserved?: number;
  characteristics?: any;
}

export interface ManagerOrderItem {
  order_id: string;
  created_at: string;
  shipped_at?: string | null;
  status: string;
  customer_name: string;
  order_item_id: string;
  product: Product; // Используем единый тип Product с расширенным набором полей
  available_quantity: number;
  purchase_price: number;
  final_price: number;
  item_total: number;
}

export interface WarehouseOrderItem {
  order_id: string;
  created_at: string;
  shipped_at?: string | null;
  status: string;
  customer_name: string;
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
  } | null;
  order_item_id: string;
  product: Product; // Используем единый тип Product с расширенным набором полей
  available_quantity: number;
  price_per_unit?: number;
  final_price?: number;
}

export interface ManagerGoodsReceipt {
  id: string;
  created_at: string;
  supplier_name: string;
  po_id: string;
  status: string;
  notes?: string; 
  description: string | null;
}

// 
export interface CustomerInfo {
  customer_id: string;
  name: string;
  contacts: {
    phone?: string | null;
    email?: string | null;
  } | null;
  tin?: string; // ИНН
  kpp?: string; // КПП
  delivery_address?: string; // Адрес доставки
  payment_terms?: string; // Условия оплаты
}

// --- Analytics Types ---

export interface AnalyticsKpis {
  total_revenue: number;
  avg_order_value: number;
  total_orders: number;
  warehouse_value: number;
}

export interface SalesChartDataPoint {
  name: string; 
  total: number;
}

export interface TopProduct {
  name: string;
  sales: number;
  initial: string;
}

export interface TopCustomer {
  name: string;
  revenue: number;
  initial: string;
}

//==============================================================================
// Invoice Types (May need review against current schema)
//==============================================================================

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'cancelled';

export type PurchaseOrderDetail = {
  id: string;
  created_at: string;
  expected_delivery_date?: string;
  status: string;
  supplier?: {
    name: string;
  };
  created_by_user?: {
    full_name: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    purchase_price: number;
    product: {
      title: string;
    };
  }>;
};

export type OrderWithCustomerDetails = {
  id: string;
  created_at: string;
  status: string;
  customer: { name: string; address: string } | null;
  customer_order_items: {
    quantity: number;
    product: {
      title: string;
    }
  }[];
};

export type InvoiceOrder = {
  id: string;
  created_at: string;
  status: string;
  customer: { name: string; address: string; email: string } | null;
  customer_order_items: {
    quantity: number;
    price_per_unit: number;
    product: {
      title: string;
    }
  }[];
};

export type OrderWithFinanceDetails = {
  id: string;
  created_at: string;
  product_name: string;
  quantity: number;
  price_per_unit: number;
  status: string;
  supplier: { name: string } | null;
  customer: { name: string } | null;
  invoice: { id: string }[] | null;
};

export type FinancialOrderItem = {
  id: string; // id of the customer_order_item
  quantity: number;
  price_per_unit: number;
  products: {
    title: string;
  } | null;
  customer_orders: {
    id: string; // id of the customer_order
    created_at: string;
    status: string;
    customers: {
      name: string;
    } | null;
    invoices: { id: string }[] | null;
  } | null;
};

export interface Invoice {
  id: string;
  created_at: string;
  order_id: string; 
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: InvoiceStatus;
  description: string | null;
}
