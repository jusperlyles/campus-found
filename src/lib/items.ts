import { Wallet, Smartphone, KeyRound, IdCard, Laptop, Package, type LucideIcon } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

export type Item = Database["public"]["Tables"]["items"]["Row"];
export type Kind = "lost" | "found";

export const CATEGORIES: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "wallet", label: "Wallet", icon: Wallet },
  { value: "phone", label: "Phone", icon: Smartphone },
  { value: "keys", label: "Keys", icon: KeyRound },
  { value: "id_card", label: "ID Card", icon: IdCard },
  { value: "laptop", label: "Laptop", icon: Laptop },
  { value: "other", label: "Other", icon: Package },
];

export const categoryOf = (v: string) => CATEGORIES.find((c) => c.value === v) ?? CATEGORIES[5]!;

export const LOCATIONS = [
  "Near City Garden Hostel",
  "Main Library",
  "Dining Hall",
  "Lecture Theatre Block",
  "Sports Grounds",
  "Student Centre",
  "Main Gate",
  "Computer Lab",
];

export const PHONE_RE = /^0\d{9}$/;

export function waLink(phone: string, text: string) {
  const intl = "256" + phone.slice(1);
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}
