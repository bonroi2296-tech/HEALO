import { mapTreatmentRow } from "../mapper";
import { supabaseServer } from "./supabaseServer";

const TREATMENT_SELECT =
  "id, slug, name, description, full_description, hospital_id, price_min, tags, images, benefits, hospitals(slug, name, location_en, location_kr)";
const TREATMENT_LIST_SELECT = "id, slug, created_at, updated_at";

export const getFeaturedTreatments = async (limit = 6) => {
  const { data, error } = await supabaseServer
    .from("treatments")
    .select(TREATMENT_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getFeaturedTreatments]", error);
    return [];
  }

  return (data || []).map(mapTreatmentRow).filter(Boolean);
};

export const getAllTreatments = async () => {
  const { data, error } = await supabaseServer
    .from("treatments")
    .select(TREATMENT_SELECT)
    .order("name", { ascending: true });

  if (error) {
    console.error("[getAllTreatments]", error);
    return [];
  }

  return (data || []).map(mapTreatmentRow).filter(Boolean);
};

export const getTreatmentList = async ({ limit = 1000 } = {}) => {
  const { data, error } = await supabaseServer
    .from("treatments")
    .select(TREATMENT_LIST_SELECT)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error("[getTreatmentList]", error);
    return [];
  }

  return data || [];
};

export const getTreatmentById = async (id) => {
  const { data, error } = await supabaseServer
    .from("treatments")
    .select(TREATMENT_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getTreatmentById]", error);
    return null;
  }

  return mapTreatmentRow(data);
};

export const getTreatmentBySlug = async (slug) => {
  if (!slug) return null;
  const { data, error } = await supabaseServer
    .from("treatments")
    .select(TREATMENT_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    if (error?.message) console.error("[getTreatmentBySlug]", error);
    return null;
  }

  return mapTreatmentRow(data);
};

export const getTreatmentSlugById = async (id) => {
  if (!id) return null;
  const { data, error } = await supabaseServer
    .from("treatments")
    .select("slug")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getTreatmentSlugById]", error);
    return null;
  }

  return data?.slug || null;
};

export const getRelatedTreatments = async (hospitalId, excludeId) => {
  if (!hospitalId) return [];
  const { data, error } = await supabaseServer
    .from("treatments")
    .select(TREATMENT_SELECT)
    .eq("hospital_id", hospitalId)
    .neq("id", excludeId)
    .limit(4);

  if (error) {
    console.error("[getRelatedTreatments]", error);
    return [];
  }

  return (data || []).map(mapTreatmentRow).filter(Boolean);
};
