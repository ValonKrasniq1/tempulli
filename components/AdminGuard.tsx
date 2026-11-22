"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkUser() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (!active) return;

        if (error || !data.user) {
          setAuthorized(false);
          router.replace("/login");
          return;
        }

        if (data.user.app_metadata?.role !== "admin") {
          setAuthorized(false);
          router.replace("/");
          return;
        }

        setAuthorized(true);
      } catch {
        if (!active) return;

        setAuthorized(false);
        router.replace("/login");
      }
    }

    checkUser();

    const { data: listener } =
      supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") {
          setAuthorized(false);
          router.replace("/login");
        }
      });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#d41c3d]" />

          <h2 className="text-xl font-extrabold text-[#d41c3d]">
            TEMPULLI
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Duke verifikuar qasjen...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}