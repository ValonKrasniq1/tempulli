"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-3 w-full rounded-xl bg-black px-4 py-3 text-sm font-extrabold text-white hover:bg-gray-800"
    >
      Dil nga Dashboard
    </button>
  );
}