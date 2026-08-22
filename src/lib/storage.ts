const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://placeholder.supabase.co";

export function productImageUrl(path: string, width = 800, quality = 80): string {
  return `${SUPABASE_URL}/storage/v1/render/image/public/product-images/${path}?width=${width}&quality=${quality}&format=webp`;
}

export function storeLogoUrl(storeId: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/store-assets/${storeId}/logo`;
}

export function storeBannerUrl(storeId: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/store-assets/${storeId}/banner`;
}

export function avatarUrl(userId: string, filename = "avatar"): string {
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${userId}/${filename}`;
}

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, and WebP images are allowed.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image must be smaller than 5 MB.";
  }
  return null;
}
