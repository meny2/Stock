import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Role } from "@/config/menu";

export async function checkAccess(shop_id: string): Promise<Role> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: membership, error } = await supabase
    .from("memberships")
    .select("role")
    .eq("shop_id", shop_id)
    .eq("user_id", user.id)
    .single();

  if (error || !membership) notFound();

  return membership.role as Role;
}

export async function getShopInfo(shop_id: string) {
  const supabase = createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, logo_url")
    .eq("id", shop_id)
    .single();

  return shop;
}

export async function getBranches(shop_id: string) {
  const supabase = createClient();

  const { data: branches } = await supabase
    .from("branches")
    .select("id, name")
    .eq("shop_id", shop_id)
    .order("name");

  return branches ?? [];
}
