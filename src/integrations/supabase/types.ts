export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customer_addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string
          customer_id: string
          id: string
          is_default: boolean | null
          neighborhood: string
          number: string
          reference: string | null
          state: string
          street: string
          zip_code: string
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean | null
          neighborhood: string
          number: string
          reference?: string | null
          state: string
          street: string
          zip_code: string
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean | null
          neighborhood?: string
          number?: string
          reference?: string | null
          state?: string
          street?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_favorite_products: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_favorite_products_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_favorite_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          content: string
          created_at: string
          customer_id: string
          id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          customer_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          customer_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          birthday: string | null
          created_at: string
          document: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          birthday?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_costs: {
        Row: {
          amount: number
          created_at: string
          frequency: string
          id: string
          name: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          frequency: string
          id?: string
          name: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          frequency?: string
          id?: string
          name?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          brand: string | null
          category: string | null
          cost_per_unit: number
          created_at: string
          id: string
          name: string
          package_amount: number
          package_cost: number
          stock: number | null
          supplier: string | null
          type: string
          unit: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          cost_per_unit: number
          created_at?: string
          id?: string
          name: string
          package_amount: number
          package_cost: number
          stock?: number | null
          supplier?: string | null
          type?: string
          unit: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          cost_per_unit?: number
          created_at?: string
          id?: string
          name?: string
          package_amount?: number
          package_cost?: number
          stock?: number | null
          supplier?: string | null
          type?: string
          unit?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_costs: {
        Row: {
          created_at: string
          hourly_rate: number
          id: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          hourly_rate: number
          id?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          hourly_rate?: number
          id?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          additional_fees: number | null
          address_id: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          delivery_date: string | null
          delivery_status: string | null
          discount_amount: number | null
          estimated_profit: number | null
          id: string
          internal_notes: string | null
          payment_method: string | null
          payment_status: string | null
          priority: boolean | null
          profit_margin: number | null
          receipt_url: string | null
          sale_origin: string | null
          sale_type: string | null
          seller_id: string | null
          seller_notes: string | null
          status: string | null
          total_amount: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          additional_fees?: number | null
          address_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          delivery_date?: string | null
          delivery_status?: string | null
          discount_amount?: number | null
          estimated_profit?: number | null
          id?: string
          internal_notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          priority?: boolean | null
          profit_margin?: number | null
          receipt_url?: string | null
          sale_origin?: string | null
          sale_type?: string | null
          seller_id?: string | null
          seller_notes?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          additional_fees?: number | null
          address_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_date?: string | null
          delivery_status?: string | null
          discount_amount?: number | null
          estimated_profit?: number | null
          id?: string
          internal_notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          priority?: boolean | null
          profit_margin?: number | null
          receipt_url?: string | null
          sale_origin?: string | null
          sale_type?: string | null
          seller_id?: string | null
          seller_notes?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          capacity: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          stock: number | null
          supplier: string | null
          type: string
          unit_cost: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          capacity?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          stock?: number | null
          supplier?: string | null
          type: string
          unit_cost: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          capacity?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          stock?: number | null
          supplier?: string | null
          type?: string
          unit_cost?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      product_packages: {
        Row: {
          created_at: string
          id: string
          package_id: string
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          package_id: string
          product_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          package_id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_packages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_pricing: {
        Row: {
          category: string | null
          competitor_price: number | null
          created_at: string
          discount_percentage: number | null
          final_price: number
          fixed_costs_share: number
          id: string
          labor_cost: number
          labor_minutes: number
          markup: number | null
          min_price: number | null
          notes: string | null
          packaging_cost: number
          pricing_strategy: string | null
          profit_margin: number
          recipe_cost: number
          recipe_id: string
          suggested_price: number
          total_cost: number
          unit_cost: number
          unit_price: number
          updated_at: string
          vendor_id: string
          yield_amount: number
        }
        Insert: {
          category?: string | null
          competitor_price?: number | null
          created_at?: string
          discount_percentage?: number | null
          final_price: number
          fixed_costs_share: number
          id?: string
          labor_cost: number
          labor_minutes: number
          markup?: number | null
          min_price?: number | null
          notes?: string | null
          packaging_cost: number
          pricing_strategy?: string | null
          profit_margin: number
          recipe_cost: number
          recipe_id: string
          suggested_price: number
          total_cost: number
          unit_cost: number
          unit_price: number
          updated_at?: string
          vendor_id: string
          yield_amount: number
        }
        Update: {
          category?: string | null
          competitor_price?: number | null
          created_at?: string
          discount_percentage?: number | null
          final_price?: number
          fixed_costs_share?: number
          id?: string
          labor_cost?: number
          labor_minutes?: number
          markup?: number | null
          min_price?: number | null
          notes?: string | null
          packaging_cost?: number
          pricing_strategy?: string | null
          profit_margin?: number
          recipe_cost?: number
          recipe_id?: string
          suggested_price?: number
          total_cost?: number
          unit_cost?: number
          unit_price?: number
          updated_at?: string
          vendor_id?: string
          yield_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_pricing_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      product_recipes: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          recipe_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          recipe_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          recipe_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category: string | null
          cost: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          profit_margin: number | null
          updated_at: string
          vendor_id: string
          visible_in_store: boolean | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          profit_margin?: number | null
          updated_at?: string
          vendor_id: string
          visible_in_store?: boolean | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          profit_margin?: number | null
          updated_at?: string
          vendor_id?: string
          visible_in_store?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allow_reviews: boolean | null
          banner_url: string | null
          created_at: string
          custom_domain: string | null
          document: string | null
          id: string
          instagram: string | null
          is_public: boolean | null
          logo_url: string | null
          name: string
          store_description: string | null
          store_name: string
          subdomain: string | null
          telegram: string | null
          theme_color: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          allow_reviews?: boolean | null
          banner_url?: string | null
          created_at?: string
          custom_domain?: string | null
          document?: string | null
          id: string
          instagram?: string | null
          is_public?: boolean | null
          logo_url?: string | null
          name: string
          store_description?: string | null
          store_name: string
          subdomain?: string | null
          telegram?: string | null
          theme_color?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          allow_reviews?: boolean | null
          banner_url?: string | null
          created_at?: string
          custom_domain?: string | null
          document?: string | null
          id?: string
          instagram?: string | null
          is_public?: boolean | null
          logo_url?: string | null
          name?: string
          store_description?: string | null
          store_name?: string
          subdomain?: string | null
          telegram?: string | null
          theme_color?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          amount: number
          created_at: string
          id: string
          ingredient_cost: number
          ingredient_id: string
          recipe_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          ingredient_cost: number
          ingredient_id: string
          recipe_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          ingredient_cost?: number
          ingredient_id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_packages: {
        Row: {
          created_at: string
          id: string
          package_cost: number
          package_id: string | null
          quantity: number
          recipe_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          package_cost?: number
          package_id?: string | null
          quantity?: number
          recipe_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          package_cost?: number
          package_id?: string | null
          quantity?: number
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_packages_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category: string | null
          cost_per_unit: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          packaging_cost: number | null
          servings: number | null
          total_cost: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          packaging_cost?: number | null
          servings?: number | null
          total_cost: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          packaging_cost?: number | null
          servings?: number | null
          total_cost?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          content: string
          created_at: string
          customer_name: string
          id: string
          rating: number
          status: string | null
          vendor_id: string
        }
        Insert: {
          content: string
          created_at?: string
          customer_name: string
          id?: string
          rating: number
          status?: string | null
          vendor_id: string
        }
        Update: {
          content?: string
          created_at?: string
          customer_name?: string
          id?: string
          rating?: number
          status?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
