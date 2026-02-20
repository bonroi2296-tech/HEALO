"use client";

import { useState, useEffect } from "react";
import { AdminAuditPage } from "./_client/AdminAuditPage";
import { createSupabaseBrowserClient } from "../../../src/lib/supabase/browser";

const supabase = createSupabaseBrowserClient();

export default function AuditLogsPage() {
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      setAccessToken(token);
    };
    fetchToken();
  }, []);

  return <AdminAuditPage authToken={accessToken} />;
}
