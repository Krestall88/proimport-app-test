export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      action_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      customer_order_items: {
        Row: {
          customer_order_id: string
          goods_receipt_item_id: string | null
          id: string
          price_per_unit: number
          product_id: string
          quantity: number
        }
        Insert: {
          customer_order_id: string
          goods_receipt_item_id?: string | null
          id?: string
          price_per_unit: number
          product_id: string
          quantity: number
        }
        Update: {
          customer_order_id?: string
          goods_receipt_item_id?: string | null
          id?: string
          price_per_unit?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_order_items_customer_order_id_fkey"
            columns: ["customer_order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_order_items_customer_order_id_fkey"
            columns: ["customer_order_id"]
            isOneToOne: false
            referencedRelation: "manager_customer_orders_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "customer_order_items_goods_receipt_item_id_fkey"
            columns: ["goods_receipt_item_id"]
            isOneToOne: false
            referencedRelation: "goods_receipt_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_order_items_goods_receipt_item_id_fkey"
            columns: ["goods_receipt_item_id"]
            isOneToOne: false
            referencedRelation: "manager_receipts_view"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "customer_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_orders: {
        Row: {
          agent_id: string | null
          created_at: string
          created_by: string
          customer_id: string
          id: string
          priority: boolean | null
          status: string
          supplier_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          created_by: string
          customer_id: string
          id?: string
          priority?: boolean | null
          status?: string
          supplier_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string
          id?: string
          priority?: boolean | null
          status?: string
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_orders_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_wishlist: {
        Row: {
          agent_id: string
          created_at: string
          customer_id: string
          id: string
          updated_at: string
          wishlist_items: Json
        }
        Insert: {
          agent_id: string
          created_at?: string
          customer_id: string
          id?: string
          updated_at?: string
          wishlist_items: Json
        }
        Update: {
          agent_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          updated_at?: string
          wishlist_items?: Json
        }
        Relationships: [
          {
            foreignKeyName: "customer_wishlist_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_wishlist_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          bank_details: Json | null
          comments: string | null
          contacts: Json | null
          created_at: string
          created_by: string
          delivery_address: string | null
          id: string
          kpp: string | null
          name: string
          payment_terms: string | null
          tin: string | null
        }
        Insert: {
          bank_details?: Json | null
          comments?: string | null
          contacts?: Json | null
          created_at?: string
          created_by: string
          delivery_address?: string | null
          id?: string
          kpp?: string | null
          name: string
          payment_terms?: string | null
          tin?: string | null
        }
        Update: {
          bank_details?: Json | null
          comments?: string | null
          contacts?: Json | null
          created_at?: string
          created_by?: string
          delivery_address?: string | null
          id?: string
          kpp?: string | null
          name?: string
          payment_terms?: string | null
          tin?: string | null
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          created_at: string
          created_by: string
          delivered_at: string | null
          id: string
          order_id: string
          photo_url: string | null
          status: string
        }
        Insert: {
          created_at?: string
          created_by: string
          delivered_at?: string | null
          id?: string
          order_id: string
          photo_url?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          delivered_at?: string | null
          id?: string
          order_id?: string
          photo_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "manager_customer_orders_view"
            referencedColumns: ["order_id"]
          },
        ]
      }
      goods_receipt_items: {
        Row: {
          batch_number: string | null
          characteristics: Json | null
          created_at: string
          description: string | null
          expiry_date: string | null
          goods_receipt_id: string
          id: string
          notes: string | null
          product_id: string
          quantity_received: number
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          characteristics?: Json | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          goods_receipt_id: string
          id?: string
          notes?: string | null
          product_id: string
          quantity_received?: number
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          characteristics?: Json | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          goods_receipt_id?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity_received?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_items_goods_receipt_id_fkey"
            columns: ["goods_receipt_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_items_goods_receipt_id_fkey"
            columns: ["goods_receipt_id"]
            isOneToOne: false
            referencedRelation: "manager_receipts_view"
            referencedColumns: ["receipt_id"]
          },
          {
            foreignKeyName: "goods_receipt_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipts: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          purchase_order_id: string
          receipt_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          purchase_order_id: string
          receipt_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          purchase_order_id?: string
          receipt_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipts_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "manager_receipts_view"
            referencedColumns: ["purchase_order_id"]
          },
          {
            foreignKeyName: "goods_receipts_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          batch_number: string | null
          created_at: string | null
          description: string | null
          expiry_date: string | null
          id: string
          product_id: string
          quantity: number
          received_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          product_id: string
          quantity: number
          received_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          product_id?: string
          quantity?: number
          received_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          comments: string | null
          created_at: string
          created_by: string
          due_date: string
          id: string
          order_id: string
          status: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          created_by: string
          due_date: string
          id?: string
          order_id: string
          status?: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          created_by?: string
          due_date?: string
          id?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "manager_customer_orders_view"
            referencedColumns: ["order_id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          characteristics: Json | null
          created_at: string
          description: string | null
          id: string
          nomenclature_code: string
          purchase_price: number | null
          selling_price: number | null
          supplier_id: string | null
          title: string
          unit: string | null
        }
        Insert: {
          category?: string | null
          characteristics?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          nomenclature_code: string
          purchase_price?: number | null
          selling_price?: number | null
          supplier_id?: string | null
          title: string
          unit?: string | null
        }
        Update: {
          category?: string | null
          characteristics?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          nomenclature_code?: string
          purchase_price?: number | null
          selling_price?: number | null
          supplier_id?: string | null
          title?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          id: string
          price_per_unit: number | null
          product_id: string
          purchase_order_id: string
          quantity: number | null
          quantity_ordered: number
        }
        Insert: {
          id?: string
          price_per_unit?: number | null
          product_id: string
          purchase_order_id: string
          quantity?: number | null
          quantity_ordered: number
        }
        Update: {
          id?: string
          price_per_unit?: number | null
          product_id?: string
          purchase_order_id?: string
          quantity?: number | null
          quantity_ordered?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "manager_receipts_view"
            referencedColumns: ["purchase_order_id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string
          expected_delivery_date: string | null
          id: string
          notes: string | null
          status: string
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          comment: string | null
          contact: Json | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          comment?: string | null
          contact?: Json | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          comment?: string | null
          contact?: Json | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      batch_inventory_view: {
        Row: {
          batch_number: string | null
          category: string | null
          description: string | null
          expiry_date: string | null
          final_price: number | null
          name: string | null
          product_id: string | null
          quantity: number | null
          sku: string | null
          unit: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_customer_orders_view: {
        Row: {
          batch_description: string | null
          batch_number: string | null
          category: string | null
          created_at: string | null
          customer_name: string | null
          description: string | null
          expiry_date: string | null
          final_price: number | null
          item_total: number | null
          order_id: string | null
          order_item_id: string | null
          product_title: string | null
          purchase_price: number | null
          quantity: number | null
          shipped_at: string | null
          sku: string | null
          status: string | null
          unit: string | null
        }
        Relationships: []
      }
      manager_inventory_view: {
        Row: {
          batch_number: string | null
          category: string | null
          description: string | null
          expiry_date: string | null
          final_price: number | null
          id: string | null
          product_id: string | null
          product_title: string | null
          purchase_price: number | null
          quantity: number | null
          sku: string | null
          unit: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_receipts_view: {
        Row: {
          comment: string | null
          item_id: string | null
          product_title: string | null
          purchase_order_id: string | null
          quantity_received: number | null
          receipt_date: string | null
          receipt_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_analytics_kpis: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_revenue: number
          avg_order_value: number
          total_orders: number
          warehouse_value: number
        }[]
      }
      get_sales_chart_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          total_revenue: number
        }[]
      }
      get_top_customers: {
        Args: Record<PropertyKey, never>
        Returns: {
          customer_id: string
          customer_name: string
          total_spent: number
        }[]
      }
      get_top_products: {
        Args: Record<PropertyKey, never>
        Returns: {
          product_id: string
          product_title: string
          total_sold: number
        }[]
      }
      process_goods_receipt: {
        Args: { p_receipt_data: Json; p_is_draft: boolean }
        Returns: string[]
      }
      upsert_inventory_on_receipt: {
        Args: { p_product_id: string; p_quantity_to_add: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const