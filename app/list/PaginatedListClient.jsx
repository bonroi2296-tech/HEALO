"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabaseClient } from "../../src/lib/data/supabaseClient";
import { mapHospitalRow, mapTreatmentRow } from "../../src/lib/mapper";
import { getLocationColumn } from "../../src/lib/language";
import { CardListSection, PersonalConciergeCTA } from "../../src/components.jsx";

export default function PaginatedListClient({ type, title, withCta = false }) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [itemsError, setItemsError] = useState(null);
  const ITEMS_PER_PAGE = 6;
  const isDev = process.env.NODE_ENV !== "production";

  const fetchItems = useCallback(
    async (isLoadMore = false) => {
      if (!isLoadMore) setLoading(true);

      const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
      const to = from + ITEMS_PER_PAGE - 1;
      const table = type === "treatment" ? "treatments" : "hospitals";
      const locCol = getLocationColumn();

      try {
        let query = supabaseClient
          .from(table)
          .select(
            type === "treatment"
              ? `*, hospitals(slug, name, location:${locCol})`
              : `*, location:${locCol}`
          )
          .range(from, to);

        const { data, error } = await query;
        if (error) {
          console.error(`[PaginatedList ${type}] Fetch Error:`, error);
          setItemsError(error);
          throw error;
        }
        setItemsError(null);

        const mappedData = data
          .map((item) =>
            type === "treatment" ? mapTreatmentRow(item) : mapHospitalRow(item)
          )
          .filter(Boolean);

        if (isLoadMore) {
          setItems((prev) => [...prev, ...mappedData]);
          setPage((prev) => prev + 1);
        } else {
          setItems(mappedData);
          setPage(0);
        }

        setHasMore(data.length === ITEMS_PER_PAGE);
      } catch (err) {
        console.error(`[PaginatedList ${type}] Fetch Error:`, err);
        setItemsError(err);
      } finally {
        setLoading(false);
      }
    },
    [type, page]
  );

  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    fetchItems(false);
  }, [type, fetchItems]);

  return (
    <>
      <CardListSection
        title={title}
        items={items}
        onCardClick={(id) => {
          const item = items.find((entry) => entry.id === id);
          const slugOrId = item?.slug || item?.id || id;
          router.push(
            `/${type === "treatment" ? "treatments" : "hospitals"}/${slugOrId}`
          );
        }}
        type={type}
      />
      {isDev && itemsError && (
        <div className="max-w-6xl mx-auto px-4 mt-2">
          <p className="text-xs text-red-500">Error: {itemsError.message}</p>
        </div>
      )}

      <div className="flex justify-center mt-8 mb-12">
        {loading && page === 0 ? (
          <div className="flex items-center gap-2 text-teal-600 font-bold">
            <Loader2 className="animate-spin" /> Loading...
          </div>
        ) : hasMore ? (
          <button
            onClick={() => fetchItems(true)}
            className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-full font-bold shadow-sm hover:bg-gray-50 hover:border-teal-500 hover:text-teal-600 transition"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Load More +"}
          </button>
        ) : items.length > 0 ? (
          <span className="text-gray-300 text-sm font-bold">End of list</span>
        ) : null}
      </div>

      {withCta && (
        <div className="mt-10">
          <PersonalConciergeCTA onClick={() => router.push("/inquiry")} />
        </div>
      )}
    </>
  );
}
