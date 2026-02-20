"use client";

import { useState, useEffect } from "react";
import { AnalyticsTab } from "./_client/AnalyticsTab";
import { createSupabaseBrowserClient } from "../../../src/lib/supabase/browser";

const supabase = createSupabaseBrowserClient();

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalLeads: 0,
    topTreatment: '-',
    hospitalOpportunities: [],
    treatmentTrends: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: inquiries } = await supabase
        .from('inquiries')
        .select('treatment_type')
        .order('created_at', { ascending: false });

      if (inquiries) {
        const totalLeads = inquiries.length;
        const avgPrice = 3500;
        const totalRevenue = totalLeads * avgPrice;

        // Treatment trends
        const typeCounts = {};
        inquiries.forEach(i => {
          const type = i.treatment_type || 'Unknown';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        const treatmentTrends = Object.entries(typeCounts)
          .map(([name, count]) => ({
            name,
            count,
            percent: Math.round((count / totalLeads) * 100)
          }))
          .sort((a, b) => b.count - a.count);

        const topTreatment = treatmentTrends[0]?.name || '-';

        setAnalytics({
          totalRevenue,
          totalLeads,
          topTreatment,
          hospitalOpportunities: [],
          treatmentTrends
        });
      }
    };

    fetchAnalytics();
  }, []);

  return <AnalyticsTab analytics={analytics} />;
}
