import { createClient } from "./client";

const SIGNED_URL_TTL = 60; // seconds

export async function getSignedUrl(bucket: string, path: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error) return null;
  return data.signedUrl;
}

export async function getSignedUrls(bucket: string, paths: string[]): Promise<(string | null)[]> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, SIGNED_URL_TTL);
  if (error) return paths.map(() => null);
  return data.map((d) => d.signedUrl);
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean }
): Promise<{ path: string; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType,
      upsert: options?.upsert ?? true,
    });
  if (error) return { path: "", error: error.message };
  return { path: data.path, error: null };
}

export async function deleteFile(bucket: string, paths: string[]): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(bucket).remove(paths);
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
