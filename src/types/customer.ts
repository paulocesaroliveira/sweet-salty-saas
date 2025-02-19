
export type Customer = {
  id: string;
  vendor_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  birthday: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerAddress = {
  id: string;
  customer_id: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  reference: string | null;
  is_default: boolean;
  created_at: string;
};

export type CustomerNote = {
  id: string;
  customer_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type CustomerFavoriteProduct = {
  id: string;
  customer_id: string;
  product_id: string;
  created_at: string;
};
