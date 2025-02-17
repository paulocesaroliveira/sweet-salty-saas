
import { supabase } from "./client";

// Initialize storage bucket for product images
export const initializeStorage = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  
  if (!buckets?.find(bucket => bucket.name === 'products')) {
    const { error } = await supabase.storage.createBucket('products', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    });
    
    if (error) {
      console.error('Error creating products bucket:', error);
    }
  }
};

// Initialize storage on app start
initializeStorage();
