export type Role = 'owner' | 'agent' | 'warehouse_manager' | 'driver' | 'accountant';

export interface CustomerOrderItem {
    id: string; // Changed to string for consistency
    product_name: string;
    quantity: number;
}

export interface CustomerOrder {
    id: string; // Changed to string for consistency
    customer_name: string;
    status: 'pending' | 'picking' | 'ready_for_shipment' | 'shipped';
    created_at: string;
    items: CustomerOrderItem[];
}


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
  contact_person: string;
  contacts: {
    phone?: string | null;
    email?: string | null;
  } | null;
}

export interface Product {
  id: string;
  title: string; // Renamed from name
  nomenclature_code: string; // Renamed from sku
  description: string | null;
  purchase_price: number;
  selling_price: number;
  category: string | null;
  unit: string | null;
}

//==============================================================================
// SCM (Supply Chain Management) Types - Warehouse Operations
//==============================================================================

// --- Purchase Orders ---

export type PurchaseOrderStatus = 'pending' | 'completed' | 'cancelled';

export type ProductInfo = {
  nomenclature_code: string;
  title: string;
  unit: string;
  description?: string | null;
  category?: string | null;
};

export type PurchaseOrderItem = {
  id: string;
  product_id: string;
  quantity_ordered: number;
  product: ProductInfo;
};

export type PurchaseOrder = {
  id: string;
  expected_delivery_date: string;
  status: string;
  supplier: {
    name: string;
  };
  purchase_order_items: PurchaseOrderItem[];
};

// --- Goods Receipts ---

// --- Batch Inventory Aggregation ---
export interface BatchInventoryItem {
  product_id: string;
  batch_number: string;
  expiry_date: string | null;
  description: string | null;
  available_quantity: number;
  product_name: string;
  sku: string;
  price: number;
  unit: string | null;
  category: string | null;
}


export type GoodsReceiptStatus = 'in_progress' | 'completed';

export type ReceiptData = {
  purchase_order_id: string;
  status: 'completed' | 'draft';
  items: {
    purchase_order_item_id: string;
    product_id: string; 
    quantity_received: number;
    batch_number: string;
    category: string;
    unit: string;
    description: string; 
    expiry_date: string | null;
    notes?: string;
  }[];
};

export interface GoodsReceiptItem {
  id: string;
  goods_receipt_id: string;
  product_id: string;
  quantity_received: number;
  expiry_date: string | null;
  discrepancy_reason: string | null;
  notes: string | null;
  // Joined data for displaying product info
  products: Pick<Product, 'title' | 'nomenclature_code'> | null;
}

export interface GoodsReceipt {
  id: string;
  created_at: string;
  purchase_order_id: string;
  status: GoodsReceiptStatus;
  notes: string | null;
  description: string | null;
  // Joined data for displaying PO and supplier info
  purchase_orders: {
    id: string;
    suppliers: Pick<Supplier, 'name'> | null;
  } | null;
  goods_receipt_items: GoodsReceiptItem[];
}

// --- Types for Warehouse Dashboard ---

export type PurchaseOrderForDashboard = {
  id: string;
  created_at: string;
  expected_delivery_date: string | null;
  status: PurchaseOrderStatus;
  suppliers: { name: string | null } | null;
  item_count: number; 
  description: string | null;
};

export type GoodsReceiptForDashboard = {
  id: string;
  purchase_order_id: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  supplier_name: string | null; 
  description: string | null;
}

// --- Inventory ---

export interface InventoryItem {
  product_id: string;
  product_title: string;
  nomenclature_code: string;
  quantity_on_hand: number;
  unit: string | null;
  location: string | null;
}

// --- Types for Detailed Receiving Page ---

export interface PurchaseOrderItemDetails extends PurchaseOrderItem {
  products: Product | null;
}

export interface PurchaseOrderDetails extends PurchaseOrder {
  suppliers: {
    name: string;
  };
  purchase_order_items: PurchaseOrderItemDetails[];
};

// --- Types for Warehouse Orders ---

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
  product_title: string;
  description?: string | null;
  sku?: string;
  category?: string;
  expiry_date?: string | null;
  batch_number?: string | null;
  quantity: number;
  unit?: string | null;
  price_per_unit?: number;
  final_price?: number;
}

//==============================================================================
// Manager Module Types
//==============================================================================

export interface ManagerInventoryItem {
  id: string;
  product_id: string;
  product_title: string;
  sku: string;
  quantity: number;
  purchase_price: number;
  final_price: number;
  expiry_date: string | null;
  description: string | null;
  batch_number: string;
  category: string | null;
  unit: string | null;
}

export interface ManagerOrderItem {
  order_id: string;
  created_at: string;
  shipped_at?: string | null;
  status: string;
  customer_name: string;
  order_item_id: string;
  product_title: string;
  description?: string | null;
  sku?: string;
  category?: string;
  expiry_date?: string | null;
  batch_number?: string | null;
  quantity: number;
  unit?: string | null;
  purchase_price: number;
  final_price: number;
  item_total: number;
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

export type Order = {
  id: string;
  created_at: string;
  status: string;
  customer: { name: string } | null;
  customer_order_items: {
    quantity: number;
    product: {
      title: string;
    }
  }[];
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
