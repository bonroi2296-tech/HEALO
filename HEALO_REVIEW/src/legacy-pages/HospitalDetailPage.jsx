"use client";

// src/pages/HospitalDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, MapPin, Star, Shield, Info, FileText, Globe, Stethoscope, Sparkles,
  GraduationCap, Award, ShieldCheck, Check, Building2, Image as ImageIcon, ArrowRight,
  MessageCircle, HelpCircle, CheckCircle2
} from "lucide-react";
import { supabase } from "../supabase";
import { mapHospitalRow, mapTreatmentRow } from "../lib/mapper";
import { getLocationColumn } from "../lib/language";
import { getLangCodeFromCookie } from "../lib/i18n";
import { event } from "../lib/ga";

export const HospitalDetailPage = ({ selectedId, setView, onTreatmentClick }) => {
  const isDev = process.env.NODE_ENV !== "production";
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isUuid = (value) => UUID_REGEX.test(String(value || ""));
  // ✅ state (DB single source of truth)
  const [hospital, setHospital] = useState(null);
  const [hospitalTreatments, setHospitalTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [treatmentsError, setTreatmentsError] = useState(null);

  // ✅ safe defaults for reviews (later DB)
  const [loadingReviews] = useState(false);
  const [realReviews] = useState([]);

  // ✅ normalize images: array | json string | single url
  const normalizeImages = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);

    if (typeof raw === "string") {
      const t = raw.trim();
      if (t.startsWith("[") && t.endsWith("]")) {
        try {
          const parsed = JSON.parse(t);
          if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {}
      }
      if (t.startsWith("http")) return [t];
    }
    return [];
  };

  const getAddressText = (h) => {
    const locationText = (h?.location || "").trim();
    const detailText = (h?.address_detail || "").trim();
    if (locationText) return locationText;
    if (detailText) return detailText;
    return isDev ? "— (address missing)" : "";
  };

  // ✅ fetch hospital + treatments from DB
  useEffect(() => {
    const run = async () => {
      if (!selectedId) return;

      setLoading(true);
      setHospital(null);
      setHospitalTreatments([]);
      setError(null);

      try {
        const locCol = getLocationColumn();
        let hQuery = supabase
          .from("hospitals")
          .select(`id,slug,name,location:${locCol},address_detail,description,images,tags,rating,reviews_count,doctor_profile,latitude,longitude,operating_hours`);

        hQuery = isUuid(selectedId)
          ? hQuery.eq("id", selectedId)
          : hQuery.eq("slug", selectedId);

        const { data: hRow, error: hErr } = await hQuery.maybeSingle();

        if (hErr) {
          console.error("[HospitalDetail] Hospital fetch error:", hErr);
          setError(hErr);
          setLoading(false);
          return;
        }
        if (!hRow) {
          const notFoundError = new Error(`Hospital not found for id: ${selectedId}`);
          console.error("[HospitalDetail]", notFoundError.message);
          setError(notFoundError);
          setLoading(false);
          return;
        }

        // mapper 있으면 쓰고, 없거나 깨지면 raw에서 최소 가공
        let h;
        try {
          h = mapHospitalRow ? mapHospitalRow(hRow) : hRow;
        } catch (e) {
          console.warn("mapHospitalRow failed, using raw:", e);
          h = hRow;
        }

        setHospital(h);
        const viewLang = getLangCodeFromCookie();
        if (viewLang) {
          event("view_hospital", {
            hospital_slug: h?.slug || null,
            lang: viewLang,
          });
        }

        const { data: tRows, error: tErr } = await supabase
          .from("treatments")
          .select("id,slug,name,description,images,tags,price_min,hospital_id")
          .eq("hospital_id", hRow.id);

        if (tErr) {
          console.error("[HospitalDetail] Treatments fetch error:", tErr);
          setTreatmentsError(tErr);
          setHospitalTreatments([]);
        } else {
          setTreatmentsError(null);
          let mapped = [];
          try {
            mapped = (tRows || []).map((r) => (mapTreatmentRow ? mapTreatmentRow(r) : r));
          } catch (e) {
            console.warn("mapTreatmentRow failed, using raw:", e);
            mapped = tRows || [];
          }
          setHospitalTreatments(mapped);
        }
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [selectedId]);

  // ✅ slideshow images (always 5)
  const placeholder = "https://placehold.co/800x600?text=No+Image";
  const galleryImages = useMemo(() => {
    const imgs = normalizeImages(hospital?.images);
    return [
      imgs[0] || placeholder,
      imgs[1] || placeholder,
      imgs[2] || placeholder,
      imgs[3] || placeholder,
      imgs[4] || placeholder,
    ];
  }, [hospital?.images]);

  const [currentSlide, setCurrentSlide] = useState(0);

  // hospital 바뀌면 슬라이드 0
  useEffect(() => {
    setCurrentSlide(0);
  }, [hospital?.id]);

  // autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [galleryImages.length]);

  const nextSlide = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  };
  const prevSlide = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // ✅ doctor profile mapping safe
  const doctor = useMemo(() => {
    // mapper가 doctorProfile로 바꿨을 수도 있고, raw는 doctor_profile일 수도 있음
    const p = hospital?.doctorProfile || hospital?.doctor_profile;
    return p || {
      name: "Medical Team",
      title: "Specialist",
      image: "https://placehold.co/200x200/cccccc/ffffff?text=Doctor",
      years: "10+",
      school: "Certified Medical School",
      specialties: ["General Care", "Consultation"],
      heroMetric: { value: "100%", label: "Satisfaction" },
    };
  }, [hospital]);

  const isPartner = Array.isArray(hospital?.tags) &&
    hospital.tags.some((t) => String(t).toLowerCase().includes("partner"));

  // ✅ FAQ / trust signals
  const faq = [
    { q: "How do I get an estimate?", a: "Submit an inquiry and we will help you compare itemized quotes." },
    { q: "Do you provide interpretation?", a: "Concierge support may be available depending on the clinic and schedule." },
    { q: "Is my information safe?", a: "We only share information with your consent for matching and coordination." },
  ];

  const trustSignals = [
    {
      icon: <ShieldCheck size={16} className={isPartner ? "text-teal-700" : "text-amber-700"} />,
      title: "Consent-based sharing",
      desc: "We only share your information with clinics after you submit an inquiry.",
    },
    {
      icon: <FileText size={16} className={isPartner ? "text-teal-700" : "text-amber-700"} />,
      title: "Clear scope guidance",
      desc: "We encourage itemized estimates so you can compare fairly.",
    },
    {
      icon: <Globe size={16} className={isPartner ? "text-teal-700" : "text-amber-700"} />,
      title: "International support",
      desc: "Coordination support may be available for overseas patients.",
    },
  ];

  // ✅ render branches (after hooks)
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500 font-bold">
        Loading hospital...
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="text-teal-700 font-extrabold text-lg mb-2">Hospital not found</div>
        {error && (
          <div className="text-red-500 text-xs mb-2 max-w-md">
            {isDev && `[DEV] ${error.message || JSON.stringify(error)}`}
          </div>
        )}
        <div className="text-gray-500 text-sm mb-6">selectedId: {String(selectedId)}</div>
        <button
          onClick={() => setView?.("list_hospital")}
          className="px-5 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
        >
          Back to Hospitals
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24 animate-in fade-in slide-in-from-bottom-4">
      {isDev && (error || treatmentsError) && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          {error && <p className="text-xs text-red-500">Hospital error: {error.message}</p>}
          {treatmentsError && <p className="text-xs text-red-500">Treatments error: {treatmentsError.message}</p>}
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Mobile slider */}
        <div className="md:hidden w-full aspect-[4/3] relative group overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
          {galleryImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
            >
              <img src={img} className="w-full h-full object-cover" alt={`Slide ${index + 1}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>
          ))}
          <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full backdrop-blur-sm transition z-20">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full backdrop-blur-sm transition z-20">
            <ArrowRight size={20} />
          </button>
          <div className="absolute bottom-3 right-3 z-20">
            <div className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
              <ImageIcon size={10} /> {currentSlide + 1}/{galleryImages.length}
            </div>
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:flex flex-row gap-2 h-[500px]">
          <div className="w-1/2 h-full relative group cursor-pointer overflow-hidden rounded-xl">
            <img src={galleryImages[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Main" />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
              <ImageIcon size={12} /> View All Photos
            </div>
          </div>
          <div className="w-1/2 h-full grid grid-cols-2 grid-rows-2 gap-2">
            {galleryImages.slice(1, 5).map((img, idx) => (
              <div key={idx} className="relative overflow-hidden cursor-pointer group rounded-xl">
                <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt={`Detail ${idx}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <button onClick={() => setView("list_hospital")} className="flex items-center text-sm font-bold text-gray-500 mb-6 hover:text-teal-600">
          <ChevronLeft size={16} /> Back to Hospitals
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {hospital?.tags?.map((tag, i) => (
                  <span key={i} className="px-2.5 py-0.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-full">{tag}</span>
                ))}
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border flex items-center gap-1 ${isPartner ? "bg-teal-600 text-white border-teal-600" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                  {isPartner ? <ShieldCheck size={12} /> : <Info size={12} />}
                  {isPartner ? "Verified Partner" : "Public Info"}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{hospital?.name}</h1>

              <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                <span className="flex items-start gap-1.5 whitespace-normal">
                  <MapPin size={18} className="text-teal-500 mt-0.5" /> 
                  {hospital?.location
                    ? `${hospital.location}${hospital.address_detail ? `, ${hospital.address_detail}` : ''}`
                    : "—"}
                </span>
                <div className="h-4 w-px bg-gray-300"></div>
                <span className="flex items-center gap-1.5">
                  <Star size={18} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-gray-900">{hospital?.rating ?? 0}</span>
                  <span className="opacity-70">({hospital?.reviews_count ?? hospital?.reviews ?? 0} reviews)</span>
                </span>
              </div>
            </div>

            {/* Medical Director */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Stethoscope size={24} className="text-teal-600" /> Medical Director
                </h2>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                  Board Certified
                </span>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:shadow-md transition">
                <div className="w-full md:w-40 md:h-40 shrink-0">
                  <div className="w-32 h-32 mx-auto md:w-40 md:h-40 rounded-full p-1 border-2 border-teal-100 relative">
                    <img src={doctor.image} className="w-full h-full object-cover rounded-full" alt="Doctor" />
                    <div className="absolute bottom-1 right-1 bg-teal-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Verified">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-extrabold text-gray-900">{doctor.name}</h3>
                  <p className="text-teal-600 font-bold text-sm mb-4">{doctor.title}</p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-100">
                      <GraduationCap size={14} className="text-gray-400" /> {doctor.school}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-100">
                      <Award size={14} className="text-gray-400" /> {doctor.years} Experience
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-100">
                      <ShieldCheck size={14} className="text-gray-400" /> Verified Profile
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mb-5">
                    {Array.isArray(doctor.specialties) &&
                      doctor.specialties.map((spec, i) => (
                        <span key={i} className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-md">
                          #{spec}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </section>

            {/* About */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 size={24} className="text-teal-600" /> About Hospital
              </h2>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <p className="text-gray-600 leading-relaxed text-lg">{hospital?.description}</p>
              </div>
            </section>

            {/* Signature Programs */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles size={24} className="text-teal-600" /> Signature Programs
              </h2>

              {hospitalTreatments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hospitalTreatments.map((item) => {
                    const thumb = normalizeImages(item.images)?.[0] || item.logo || "https://placehold.co/600x600?text=treatment";
                    return (
                      <div
                        key={item.id}
                        onClick={() => onTreatmentClick?.(item.slug || item.id)}
                        className="flex bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-teal-200 transition cursor-pointer group"
                      >
                        <div className="w-32 h-24 bg-gray-200 shrink-0 relative">
                          <img src={thumb} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="img" />
                        </div>
                        <div className="p-4 flex flex-col justify-center flex-1">
                          <h4 className="font-bold text-gray-900 text-sm group-hover:text-teal-600 line-clamp-2 mb-1">
                            {item.title || item.name}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-1 mb-2">{item.desc || item.description}</p>
                          <div className="flex items-center justify-between mt-auto">
                            <p className="text-teal-600 font-extrabold text-sm">{item.price || item.price_min || ""}</p>
                            <ArrowRight size={14} className="text-gray-300 group-hover:text-teal-500 transition" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-8 text-center text-gray-500">No treatments listed yet.</div>
              )}
            </section>

            {/* Reviews (still empty) */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star size={24} className="text-teal-600" /> Patient Reviews
              </h2>
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                {loadingReviews ? (
                  <div className="text-center py-8 text-gray-400 text-sm animate-pulse">Loading reviews...</div>
                ) : realReviews.length > 0 ? (
                  <div className="space-y-6">...</div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <MessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 font-bold">No reviews yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Be the first to leave a review for this hospital!</p>
                  </div>
                )}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle size={24} className="text-teal-600" /> Frequently Asked Questions
              </h2>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {faq.map((item, i) => (
                  <div key={i} className={`p-5 ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                    <p className="text-sm font-extrabold text-gray-900">{item.q}</p>
                    <p className="text-xs text-gray-600 leading-relaxed mt-2">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT (CTA) */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-4">
              <div className="bg-white border border-teal-100 rounded-3xl p-6 shadow-xl">
                <h3 className="font-bold text-lg mb-1">Make an Inquiry</h3>
                <p className="text-xs text-gray-400 mb-6">Direct response within 24 hours.</p>

                <button
                  onClick={() => setView("inquiry")}
                  className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} /> Contact via HEALO
                </button>

                <div className="mt-5 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-teal-600" /> Why contact via HEALO?
                  </p>
                  <ul className="mt-2 space-y-2 text-[11px] text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-teal-600 mt-0.5 shrink-0" />
                      Compare options with an itemized estimate
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-teal-600 mt-0.5 shrink-0" />
                      Coordinator support for international patients
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-teal-600 mt-0.5 shrink-0" />
                      Consent-based sharing & privacy guidance
                    </li>
                  </ul>
                </div>
              </div>

              <div className={`rounded-2xl p-5 border ${isPartner ? "bg-teal-50 border-teal-100" : "bg-amber-50 border-amber-100"}`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`shrink-0 mt-0.5 ${isPartner ? "text-teal-700" : "text-amber-700"}`}>
                    <Shield size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                      Trust & Verification
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isPartner ? "bg-white/60 text-teal-700 border-teal-200" : "bg-white/60 text-amber-700 border-amber-200"
                      }`}>
                        {isPartner ? "Verified Partner" : "Public Info"}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-600 leading-snug mt-1">
                      {isPartner
                        ? "This clinic has been reviewed for safety & foreign patient coordination standards."
                        : "This page may include publicly available info. Request a plan via HEALO for accurate details."}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {trustSignals.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">{item.icon}</div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900">{item.title}</p>
                        <p className="text-[11px] text-gray-600 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-black/5">
                  <p className="text-[10px] text-gray-500 leading-snug mt-2">
                    HEALO provides concierge & lead coordination. Final medical decisions and quotes are provided by the clinic.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
