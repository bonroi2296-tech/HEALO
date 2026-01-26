"use client";

// src/pages/TreatmentDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  MapPin,
  Star,
  Shield,
  Check,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  ThumbsUp,
  Map,
  UserCheck,
  Clock,
  FileText,
  Globe,
} from "lucide-react";
import { supabase } from "../supabase";
import { ReviewModal } from "../components/Modals";
import { normalizeImages } from "../lib/mapper";
import { GoogleMapComponent } from "../components/GoogleMap";
import { getLocationColumn } from "../lib/language";
import { formatDate, formatPriceRange } from "../lib/i18n/format";
import { getLangCodeFromCookie } from "../lib/i18n";
import { event } from "../lib/ga";

export const TreatmentDetailPage = ({
  selectedId,
  setView,
  setInquiryMode,
  onHospitalClick,
  onTreatmentClick,
}) => {
  const id = selectedId;
  const isDev = process.env.NODE_ENV !== "production";

  const [treatment, setTreatment] = useState(null);
  const [hospital, setHospital] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [treatmentError, setTreatmentError] = useState(null);
  const [hospitalError, setHospitalError] = useState(null);
  const [relatedError, setRelatedError] = useState(null);

  const [realReviews, setRealReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [relatedTreatments, setRelatedTreatments] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ---- helpers ----
  const getAddressText = (h) => {
    const locationText = (h?.location || "").trim();
    const detailText = (h?.address_detail || "").trim();
    if (locationText) return locationText;
    if (detailText) return detailText;
    return isDev ? "— (address missing)" : "";
  };

  const getOperatingHoursRows = (hours) => {
    const data = hours && typeof hours === "object" ? hours : {};
    return [
      { label: "Mon–Fri", time: data.mon_fri || "" },
      { label: "Sat", time: data.sat || "" },
      { label: "Sun / Holidays", time: data.sun || data.sun_holidays || data.sun_holiday || "" },
    ];
  };

  const getDayTone = (label) => {
    if (label.toLowerCase().includes("sat")) {
      return { label: "text-amber-600", time: "text-amber-600/70" };
    }
    if (label.toLowerCase().includes("sun")) {
      return { label: "text-red-500", time: "text-red-500/70" };
    }
    return { label: "text-gray-700", time: "text-gray-500" };
  };

  const goBackToTreatments = () => {
    if (setView) setView("list_treatment");
    else window.history.back();
  };

  // 스크롤 초기화
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isUuid = (value) => UUID_REGEX.test(String(value || ""));

  // 1) Treatment 단건 fetch (id OR slug)
  useEffect(() => {
    let alive = true;

    const fetchTreatmentAndHospital = async () => {
      if (!id) return;

      setLoading(true);
      setLoadError(null);
      setTreatmentError(null);
      setHospitalError(null);
      setTreatment(null);
      setHospital(null);

      try {
        // ✅ uuid든 slug든 잡는다
        let tQuery = supabase
          .from("treatments")
          .select(
            "id,name,slug,description,full_description,benefits,tags,images,thumbnail,price_min,price_max,hospital_id"
          );

        tQuery = isUuid(id) ? tQuery.eq("id", id) : tQuery.eq("slug", id);

        const { data: tRow, error: tErr } = await tQuery.single();

        if (tErr) {
          // logError는 클라이언트에서만 사용 가능하므로 조건부 처리
          if (process.env.NODE_ENV === 'development') {
            console.error("[TreatmentDetail] Treatment fetch error:", tErr);
          }
          setTreatmentError(tErr);
          throw tErr;
        }
        if (!tRow) throw new Error("Treatment not found");

        // images fallback: images -> thumbnail
        const imgs = normalizeImages(tRow.images);
        const imgsWithThumbFallback = imgs.length > 0 ? imgs : normalizeImages(tRow.thumbnail);

        const t = {
          id: tRow.id,
          slug: tRow.slug || null,
          title: tRow.name || "",
          name: tRow.name || "",
          desc: tRow.description || "",
          fullDescription: tRow.full_description || "",
          benefits: Array.isArray(tRow.benefits) ? tRow.benefits : [],
          tags: Array.isArray(tRow.tags) ? tRow.tags : [],
          images: imgsWithThumbFallback,
          thumbnail: tRow.thumbnail || null,
          hospitalId: tRow.hospital_id,
          price: formatPriceRange(tRow.price_min, tRow.price_max, "en"),
          price_min: tRow.price_min,
          price_max: tRow.price_max,
        };

        if (!alive) return;
        setTreatment(t);
        const viewLang = getLangCodeFromCookie();
        if (viewLang) {
          event("view_treatment", {
            treatment_slug: tRow.slug || null,
            lang: viewLang,
          });
        }

        // 2) Hospital 단건 fetch
        if (t.hospitalId) {
          const locCol = getLocationColumn();
          const { data: hRow, error: hErr } = await supabase
            .from("hospitals")
            .select(`id,slug,name,location:${locCol},address_detail,description,images,thumbnail,tags,rating,reviews_count,latitude,longitude,operating_hours`)
            .eq("id", t.hospitalId)
            .single();

          if (hErr) {
            console.error("[TreatmentDetail] Hospital fetch error:", hErr);
            setHospitalError(hErr);
            throw hErr;
          }

          const hImgs = normalizeImages(hRow.images);
          const hImgsFinal = hImgs.length > 0 ? hImgs : normalizeImages(hRow.thumbnail);

          const h = {
            id: hRow.id,
            slug: hRow.slug || null,
            name: hRow.name || "",
            location: hRow.location || "",
            address_detail: hRow.address_detail || "",
            description: hRow.description || "",
            tags: Array.isArray(hRow.tags) ? hRow.tags : [],
            rating: hRow.rating ?? null,
            reviews_count: hRow.reviews_count ?? null,
            images: hImgsFinal,
            thumbnail: hRow.thumbnail || null,
            latitude: hRow.latitude || null,
            longitude: hRow.longitude || null,
            operating_hours: hRow.operating_hours || null,
          };

          if (!alive) return;
          setHospital(h);
        }
      } catch (e) {
        console.error("[TreatmentDetail] fetch failed:", e);
        if (!alive) return;
        setLoadError(e);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    fetchTreatmentAndHospital();

    return () => {
      alive = false;
    };
  }, [id]);

  // 3) 리뷰 fetch
  useEffect(() => {
    let alive = true;

    const fetchReviews = async () => {
      if (!treatment?.id) return;

      setLoadingReviews(true);
      try {
        const { data: reviews, error } = await supabase
          .from("reviews")
          .select("id,created_at,user_name,country,rating,content,helpful_count,treatment_id")
          .eq("treatment_id", treatment.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!alive) return;
        setRealReviews(reviews || []);
      } catch (e) {
        console.error("[TreatmentDetail] review fetch failed:", e);
        if (!alive) return;
        setRealReviews([]);
      } finally {
        if (!alive) return;
        setLoadingReviews(false);
      }
    };

    fetchReviews();
    return () => {
      alive = false;
    };
  }, [treatment?.id]);

  // 4) Related treatments fetch (같은 병원 4개)
  useEffect(() => {
    let alive = true;

    const fetchRelated = async () => {
      if (!treatment?.hospitalId || !treatment?.id) return;

      try {
        setRelatedError(null);
        // ✅ 여기서 price_display 같은 컬럼 절대 쓰면 안됨 (너 DB에 없음)
        const { data: rows, error } = await supabase
          .from("treatments")
          .select("id,slug,name,price_min,price_max,thumbnail,images,hospital_id")
          .eq("hospital_id", treatment.hospitalId)
          .neq("id", treatment.id)
          .limit(4);

        if (error) {
          console.error("[TreatmentDetail] Related treatments fetch error:", error);
          setRelatedError(error);
          throw error;
        }

        const mapped = (rows || []).map((r) => ({
          id: r.id,
          slug: r.slug || null,
          name: r.name || "",
          price: formatPriceRange(r.price_min, r.price_max, "en"),
          images: normalizeImages(r.images),
          thumbnail: r.thumbnail || null,
          hospitalId: r.hospital_id,
        }));

        if (!alive) return;
        setRelatedTreatments(mapped);
      } catch (e) {
        console.error("[TreatmentDetail] related fetch failed:", e);
        if (!alive) return;
        setRelatedTreatments([]);
      }
    };

    fetchRelated();
    return () => {
      alive = false;
    };
  }, [treatment?.hospitalId, treatment?.id]);

  // 5) Gallery 5장 강제 유지 (디자인 유지)
  const galleryImages = useMemo(() => {
    const imgs = normalizeImages(treatment?.images);
    const base = imgs.length > 0 ? imgs : normalizeImages(treatment?.thumbnail);

    const placeholders = [
      "https://placehold.co/1200x900?text=Procedure+1",
      "https://placehold.co/1200x900?text=Procedure+2",
      "https://placehold.co/1200x900?text=Procedure+3",
      "https://placehold.co/1200x900?text=Procedure+4",
      "https://placehold.co/1200x900?text=Procedure+5",
    ];

    const out = [...base];
    while (out.length < 5) out.push(placeholders[out.length] || placeholders[0]);
    return out.slice(0, 5);
  }, [treatment?.images, treatment?.thumbnail]);

  // 슬라이드 index가 이미지 개수보다 커지는 거 방지
  useEffect(() => {
    setCurrentSlide(0);
  }, [galleryImages.length, id]);

  const nextSlide = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  };
  const prevSlide = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const averageRating =
    realReviews.length > 0
      ? (realReviews.reduce((acc, r) => acc + (r.rating || 5), 0) / realReviews.length).toFixed(1)
      : null;

  const ServiceBenefits = () => (
    <div className="bg-teal-50/80 rounded-xl p-4 border border-teal-100">
      <p className="text-xs font-bold text-teal-800 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
        <ShieldCheck size={14} /> HEALO Guarantee
      </p>
      <ul className="space-y-2.5">
        <li className="flex items-start gap-2.5">
          <div className="bg-white p-1 rounded-full shadow-sm text-teal-600">
            <CheckCircle2 size={12} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-800 block">Free Comparison Quote</span>
            <span className="text-[10px] text-gray-500 leading-tight">Compare top 3 clinics at once.</span>
          </div>
        </li>
        <li className="flex items-start gap-2.5">
          <div className="bg-white p-1 rounded-full shadow-sm text-teal-600">
            <UserCheck size={12} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-800 block">Full Concierge</span>
            <span className="text-[10px] text-gray-500 leading-tight">Translation & pickup included.</span>
          </div>
        </li>
        <li className="flex items-start gap-2.5">
          <div className="bg-white p-1 rounded-full shadow-sm text-teal-600">
            <Clock size={12} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-800 block">Fast Response</span>
            <span className="text-[10px] text-gray-500 leading-tight">Average reply within 1 hour.</span>
          </div>
        </li>
      </ul>
    </div>
  );

  // ---- render states ----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-teal-600 font-bold">
        Loading Treatment...
      </div>
    );
  }

  if (!treatment || loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-teal-700 font-extrabold text-lg mb-2">Treatment not found</div>
        {loadError && isDev && (
          <div className="text-red-500 text-xs mb-2 max-w-md">
            [DEV] {loadError?.message || JSON.stringify(loadError)}
          </div>
        )}
        <div className="text-gray-500 text-sm mb-6">Please go back and try again.</div>
        <button
          onClick={goBackToTreatments}
          className="px-5 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
        >
          Back to Treatments
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24 animate-in fade-in slide-in-from-bottom-4">
      {isDev && (treatmentError || hospitalError || relatedError) && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          {treatmentError && <p className="text-xs text-red-500">Treatment error: {treatmentError.message}</p>}
          {hospitalError && <p className="text-xs text-red-500">Hospital error: {hospitalError.message}</p>}
          {relatedError && <p className="text-xs text-red-500">Related treatments error: {relatedError.message}</p>}
        </div>
      )}
      {/* 1. 이미지 섹션 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Mobile slider */}
        <div className="md:hidden w-full aspect-[4/3] relative group overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
          <img src={galleryImages[currentSlide]} className="w-full h-full object-cover" alt="Main" />
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full backdrop-blur-sm transition z-20"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full backdrop-blur-sm transition z-20"
          >
            <ArrowRight size={20} />
          </button>
          <div className="absolute bottom-3 right-3 z-20">
            <div className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
              <ImageIcon size={10} /> {currentSlide + 1}/{galleryImages.length}
            </div>
          </div>
        </div>

        {/* Desktop grid (5장 유지) */}
        <div className="hidden md:flex flex-row gap-2 h-[500px]">
          <div className="w-1/2 h-full relative group cursor-pointer overflow-hidden rounded-xl">
            <img
              src={galleryImages[0]}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Main"
            />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
              <ImageIcon size={12} /> View All Photos
            </div>
          </div>
          <div className="w-1/2 h-full grid grid-cols-2 grid-rows-2 gap-2">
            {galleryImages.slice(1, 5).map((img, idx) => (
              <div key={idx} className="relative overflow-hidden cursor-pointer group rounded-xl">
                <img
                  src={img}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  alt={`Detail ${idx + 1}`}
                />
                {idx === 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-sm">
                    + More
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 컨텐츠 섹션 */}
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={goBackToTreatments}
          className="flex items-center text-sm font-bold text-gray-500 mb-6 hover:text-teal-600"
        >
          <ChevronLeft size={16} /> Back to Treatments
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header */}
            <div>
              <div className="flex gap-2 mb-3 flex-wrap">
                {(treatment.tags || []).map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{treatment.title}</h1>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                Provided by{" "}
                <span
                  onClick={() =>
                    onHospitalClick?.(hospital?.slug || treatment.hospitalId)
                  }
                  className="font-bold text-teal-600 underline cursor-pointer hover:text-teal-800 ml-1"
                >
                  {hospital?.name || "Hospital"}
                </span>
                <Shield size={14} className="text-teal-500 fill-teal-500 ml-1" />
              </div>
            </div>

            {/* Overview */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Treatment Overview</h3>
              <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap">
                {treatment.fullDescription || treatment.desc}
              </p>

              {Array.isArray(treatment.benefits) && treatment.benefits.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-teal-500 fill-teal-500" /> Key Benefits
                  </h4>
                  <ul className="space-y-3">
                    {treatment.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5 bg-teal-50 rounded-full p-1 shrink-0">
                          <Check size={12} className="text-teal-600 stroke-[3]" />
                        </div>
                        <span className="text-gray-700 font-medium text-sm leading-snug">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Reviews */}
            <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Verified Reviews
                    {realReviews.length > 0 ? (
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                        {averageRating}/5.0
                      </span>
                    ) : (
                      <span className="bg-teal-50 text-teal-600 text-xs px-2 py-0.5 rounded-full border border-teal-100">
                        New Treatment
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    From real patients who visited through HEALO
                  </p>
                </div>

                {realReviews.length > 0 && (
                  <span
                    onClick={() => setIsReviewModalOpen(true)}
                    className="text-teal-600 text-sm font-bold cursor-pointer hover:underline"
                  >
                    View All ({realReviews.length})
                  </span>
                )}
              </div>

              {loadingReviews ? (
                <div className="text-center py-8 text-gray-400 text-sm animate-pulse">Checking verified reviews...</div>
              ) : realReviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {realReviews.slice(0, 3).map((review) => (
                    <div
                      key={review.id}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm uppercase">
                            {review.user_name?.[0] || "U"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 line-clamp-1">{review.user_name}</p>
                              <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">
                                {review.country}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {review.created_at
                                ? formatDate(review.created_at, "en")
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex text-yellow-400 gap-0.5 shrink-0">
                          {[...Array(review.rating || 5)].map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" />
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-4">
                        "{review.content}"
                      </p>

                      {/* Review Images (if available) */}
                      <div className="flex gap-2 mb-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-[10px] text-gray-500 font-bold cursor-pointer hover:bg-gray-300 transition">
                          Review 1
                        </div>
                        {review.id === realReviews[0]?.id && (
                          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-[10px] text-gray-500 font-bold cursor-pointer hover:bg-gray-300 transition">
                            Result
                          </div>
                        )}
                      </div>

                      <div className="mt-auto flex items-center gap-1 text-xs text-gray-400">
                        <ThumbsUp size={12} /> Helpful ({review.helpful_count || 0})
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <MessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 font-bold">No reviews yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Be the first to share your experience with this treatment!</p>
                </div>
              )}
            </section>

            {/* Hospital Overview */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Hospital Overview</h3>
              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                <div className="p-6 md:w-1/2 flex flex-col justify-between bg-white">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{hospital?.name || "Hospital"}</h4>
                    <div className="flex items-start gap-2 text-xs text-gray-500 mb-3">
                      <MapPin size={14} className="mt-0.5" /> 
                      <div className="min-w-0">
                        <span className="line-clamp-2 whitespace-normal">{getAddressText(hospital)}</span>
                        {hospital?.address_detail && (
                          <span className="inline-block ml-2 bg-gray-100 text-gray-700 text-xs font-bold px-2 py-0.5 rounded">
                            {hospital.address_detail}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3">
                      {hospital?.description || "—"}
                    </p>

                    <button
                      onClick={() =>
                        onHospitalClick?.(hospital?.slug || treatment.hospitalId)
                      }
                      className="text-teal-600 font-bold text-xs hover:underline flex items-center gap-1"
                    >
                      View Hospital Details <ArrowRight size={12} />
                    </button>
                  </div>

                  {/* Operating Hours */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h5 className="text-sm font-bold text-gray-900 mb-3">Operating Hours</h5>
                    <div className="space-y-2 text-xs">
                      {getOperatingHoursRows(hospital?.operating_hours).map((row) => {
                        const tone = getDayTone(row.label);
                        return (
                          <div key={row.label} className="flex justify-between">
                            <span className={`font-medium ${tone.label}`}>{row.label}:</span>
                            <span className={tone.time}>{row.time || "—"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 md:w-1/2 min-h-[200px] rounded-r-3xl overflow-hidden">
                  <GoogleMapComponent 
                    location={hospital?.location} 
                    hospitalName={hospital?.name}
                    latitude={hospital?.latitude}
                    longitude={hospital?.longitude}
                  />
                </div>
              </div>
            </section>

            {/* Related treatments */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">More from {hospital?.name || "this hospital"}</h3>

              {relatedTreatments.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedTreatments.map((item) => {
                    const thumb =
                      normalizeImages(item.images)?.[0] ||
                      item.thumbnail ||
                      "https://placehold.co/600x600?text=treatment";

                    return (
                      <div
                        key={item.id}
                        onClick={() => onTreatmentClick?.(item.slug || item.id)}
                        className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer group flex flex-col"
                      >
                        <div className="aspect-[4/3] bg-gray-200 overflow-hidden relative">
                          <img
                            src={thumb}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            alt={item.name}
                          />
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h4 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-teal-600">
                            {item.name}
                          </h4>
                          <p className="text-teal-600 font-extrabold text-sm mt-auto">{item.price}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No other treatments available.</div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white border border-teal-100 rounded-3xl p-6 shadow-xl text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estimated Price</p>
                <div className="text-3xl font-extrabold text-teal-600 mb-6">{treatment.price}</div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setInquiryMode?.("select");
                      setView?.("inquiry");
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={20} /> Contact Via HEALO
                  </button>

                  <button
                    onClick={() =>
                      onHospitalClick?.(hospital?.slug || treatment.hospitalId)
                    }
                    className="w-full bg-white border-2 border-teal-100 text-teal-700 font-bold py-3 rounded-xl hover:bg-teal-50 transition"
                  >
                    View Hospital Profile
                  </button>
                </div>

                <div className="mt-6 text-left">
                  <ServiceBenefits />
                </div>

                {/* Trust & Verification */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Trust & Verification
                  </h4>
                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={14} className="text-teal-600 mt-0.5 shrink-0" />
                      <div className="leading-snug">
                        <p className="font-bold text-gray-900">Publicly available info.</p>
                        <p className="text-gray-500 text-[10px] mt-1">Information may vary. Request a plan for accurate details.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield size={14} className="text-teal-600 mt-0.5 shrink-0" />
                      <div className="leading-snug">
                        <p className="font-bold text-gray-900">Licensed Medical Institution</p>
                        <p className="text-gray-500 text-[10px] mt-1">Verified by Korean medical authorities</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={14} className="text-teal-600 mt-0.5 shrink-0" />
                      <div className="leading-snug">
                        <p className="font-bold text-gray-900">Consent-based Sharing</p>
                        <p className="text-gray-500 text-[10px] mt-1">Your information is shared only with your consent</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText size={14} className="text-teal-600 mt-0.5 shrink-0" />
                      <div className="leading-snug">
                        <p className="font-bold text-gray-900">Transparent Quote</p>
                        <p className="text-gray-500 text-[10px] mt-1">Itemized estimates for fair comparison</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe size={14} className="text-teal-600 mt-0.5 shrink-0" />
                      <div className="leading-snug">
                        <p className="font-bold text-gray-900">Global Support</p>
                        <p className="text-gray-500 text-[10px] mt-1">Coordination for international patients</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Benefits */}
        <div className="lg:hidden mt-8 mb-4">
          <ServiceBenefits />
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        reviews={realReviews}
      />
    </div>
  );
};
