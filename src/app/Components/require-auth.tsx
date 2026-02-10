"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../lib/client";

export default function RequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        const redirect = searchParams?.toString();
        const redirectPath = redirect ? `${pathname}?${redirect}` : pathname;
        router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      }
    };

    checkSession();
  }, [pathname, router, searchParams]);

  return null;
}
