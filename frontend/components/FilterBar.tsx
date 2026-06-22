"use client";

import { Check, ChevronDown, Filter, GraduationCap, MapPin, Tag, Briefcase } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface FilterBarProps {
  selectedQualification: string;
  selectedState: string;
  selectedCategory: string;
  selectedSector?: string;
  hideCategory?: boolean;
  hideSector?: boolean;
  onFilterChange: (filters: { qualification: string; state: string; category: string; sector?: string }) => void;
}

const QUALIFICATIONS = [
  "All Qualifications",
  "10th",
  "12th",
  "Graduate",
  "Post Graduate",
  "B.Tech",
  "Diploma",
  "ITI"
];

const STATES = [
  "All States",
  "Central",
  "Uttar Pradesh",
  "Bihar",
  "Rajasthan",
  "Delhi",
  "Maharashtra",
  "Madhya Pradesh",
  "Haryana",
  "West Bengal"
];

const CATEGORIES = [
  "All Categories",
  "Job",
  "Result",
  "Admit Card",
  "Answer Key",
  "Sarkari Yojana",
  "Scholarship"
];

const SECTORS = [
  "All Sectors",
  "Banking",
  "SSC",
  "Railway",
  "UPSC",
  "Defense / Police",
  "Teaching",
  "State Jobs",
  "Others"
];

export default function FilterBar({
  selectedQualification,
  selectedState,
  selectedCategory,
  selectedSector,
  hideCategory = false,
  hideSector = false,
  onFilterChange
}: FilterBarProps) {
  const [qualOpen, setQualOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [sectorOpen, setSectorOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setQualOpen(false);
        setStateOpen(false);
        setCatOpen(false);
        setSectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate active grid columns based on hidden filters
  const getGridColsClass = () => {
    let count = 4;
    if (hideCategory) count--;
    if (hideSector) count--;
    
    if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    if (count === 3) return "grid-cols-1 sm:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2";
  };

  return (
    <div 
      ref={containerRef}
      className="relative bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md"
    >
      {/* Subtle glowing lines under the borders */}
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />

      <div className="flex items-center gap-2 mb-4 text-slate-200 font-bold text-sm uppercase tracking-wider">
        <Filter className="h-4 w-4 text-emerald-400" />
        Filter Notifications
      </div>

      <div className={`grid gap-4 ${getGridColsClass()}`}>
        {/* Category Filter */}
        {!hideCategory && (
          <div className="relative">
            <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Tag className="h-3 w-3 text-slate-500" /> Category
            </label>
            <button
              onClick={() => {
                setCatOpen(!catOpen);
                setQualOpen(false);
                setStateOpen(false);
                setSectorOpen(false);
              }}
              className={`w-full bg-slate-950/60 border ${catOpen ? "border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.1)]" : "border-slate-800"} rounded-xl py-2.5 px-3.5 text-left text-sm text-slate-200 flex justify-between items-center hover:border-slate-700 hover:bg-slate-900/30 transition duration-250 cursor-pointer`}
            >
              <span className="truncate">{selectedCategory || "All Categories"}</span>
              <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${catOpen ? "transform rotate-180 text-emerald-400" : ""}`} />
            </button>
            {catOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-slate-950/95 border border-slate-800/90 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto backdrop-blur-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      onFilterChange({
                        qualification: selectedQualification,
                        state: selectedState,
                        category: cat === "All Categories" ? "" : cat,
                        sector: selectedSector
                      });
                      setCatOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 text-sm flex items-center justify-between transition cursor-pointer ${
                      (selectedCategory === cat || (cat === "All Categories" && !selectedCategory)) 
                        ? "text-emerald-400 font-semibold bg-emerald-500/5" 
                        : "text-slate-300"
                    }`}
                  >
                    <span>{cat}</span>
                    {(selectedCategory === cat || (cat === "All Categories" && !selectedCategory)) && (
                      <Check className="h-4 w-4 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sector Filter */}
        {!hideSector && (
          <div className="relative">
            <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="h-3 w-3 text-slate-500" /> Job Sector
            </label>
            <button
              onClick={() => {
                setSectorOpen(!sectorOpen);
                setCatOpen(false);
                setQualOpen(false);
                setStateOpen(false);
              }}
              className={`w-full bg-slate-950/60 border ${sectorOpen ? "border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.1)]" : "border-slate-800"} rounded-xl py-2.5 px-3.5 text-left text-sm text-slate-200 flex justify-between items-center hover:border-slate-700 hover:bg-slate-900/30 transition duration-250 cursor-pointer`}
            >
              <span className="truncate">{selectedSector || "All Sectors"}</span>
              <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${sectorOpen ? "transform rotate-180 text-emerald-400" : ""}`} />
            </button>
            {sectorOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-slate-950/95 border border-slate-800/90 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto backdrop-blur-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                {SECTORS.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      onFilterChange({
                        qualification: selectedQualification,
                        state: selectedState,
                        category: selectedCategory,
                        sector: sec === "All Sectors" ? "" : sec
                      });
                      setSectorOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 text-sm flex items-center justify-between transition cursor-pointer ${
                      (selectedSector === sec || (sec === "All Sectors" && !selectedSector)) 
                        ? "text-emerald-400 font-semibold bg-emerald-500/5" 
                        : "text-slate-300"
                    }`}
                  >
                    <span>{sec}</span>
                    {(selectedSector === sec || (sec === "All Sectors" && !selectedSector)) && (
                      <Check className="h-4 w-4 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Qualification Filter */}
        <div className="relative">
          <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider flex items-center gap-1">
            <GraduationCap className="h-3 w-3 text-slate-500" /> Education
          </label>
          <button
            onClick={() => {
              setQualOpen(!qualOpen);
              setCatOpen(false);
              setStateOpen(false);
              setSectorOpen(false);
            }}
            className={`w-full bg-slate-950/60 border ${qualOpen ? "border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.1)]" : "border-slate-800"} rounded-xl py-2.5 px-3.5 text-left text-sm text-slate-200 flex justify-between items-center hover:border-slate-700 hover:bg-slate-900/30 transition duration-250 cursor-pointer`}
          >
            <span className="truncate">{selectedQualification || "All Qualifications"}</span>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${qualOpen ? "transform rotate-180 text-emerald-400" : ""}`} />
          </button>
          {qualOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-slate-950/95 border border-slate-800/90 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto backdrop-blur-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              {QUALIFICATIONS.map((qual) => (
                <button
                  key={qual}
                  onClick={() => {
                    onFilterChange({
                      qualification: qual === "All Qualifications" ? "" : qual,
                      state: selectedState,
                      category: selectedCategory,
                      sector: selectedSector
                    });
                    setQualOpen(false);
                  }}
                  className={`w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 text-sm flex items-center justify-between transition cursor-pointer ${
                    (selectedQualification === qual || (qual === "All Qualifications" && !selectedQualification)) 
                      ? "text-emerald-400 font-semibold bg-emerald-500/5" 
                      : "text-slate-300"
                  }`}
                >
                  <span>{qual}</span>
                  {(selectedQualification === qual || (qual === "All Qualifications" && !selectedQualification)) && (
                    <Check className="h-4 w-4 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* State Filter */}
        <div className="relative">
          <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider flex items-center gap-1">
            <MapPin className="h-3 w-3 text-slate-500" /> State / Region
          </label>
          <button
            onClick={() => {
              setStateOpen(!stateOpen);
              setQualOpen(false);
              setCatOpen(false);
              setSectorOpen(false);
            }}
            className={`w-full bg-slate-950/60 border ${stateOpen ? "border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.1)]" : "border-slate-800"} rounded-xl py-2.5 px-3.5 text-left text-sm text-slate-200 flex justify-between items-center hover:border-slate-700 hover:bg-slate-900/30 transition duration-250 cursor-pointer`}
          >
            <span className="truncate">{selectedState || "All States"}</span>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${stateOpen ? "transform rotate-180 text-emerald-400" : ""}`} />
          </button>
          {stateOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-slate-950/95 border border-slate-800/90 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto backdrop-blur-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              {STATES.map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    onFilterChange({
                      qualification: selectedQualification,
                      state: st === "All States" ? "" : st,
                      category: selectedCategory,
                      sector: selectedSector
                    });
                    setStateOpen(false);
                  }}
                  className={`w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 text-sm flex items-center justify-between transition cursor-pointer ${
                    (selectedState === st || (st === "All States" && !selectedState)) 
                      ? "text-emerald-400 font-semibold bg-emerald-500/5" 
                      : "text-slate-300"
                  }`}
                >
                  <span>{st}</span>
                  {(selectedState === st || (st === "All States" && !selectedState)) && (
                    <Check className="h-4 w-4 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
