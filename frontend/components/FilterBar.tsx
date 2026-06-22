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

  // Calculate active grid columns
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
      className="relative bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs"
    >
      <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-sm uppercase tracking-wider">
        <Filter className="h-4 w-4 text-blue-600" />
        Filter Notifications
      </div>

      <div className={`grid gap-4 ${getGridColsClass()}`}>
        {/* Category Filter */}
        {!hideCategory && (
          <div className="relative">
            <label className="block text-xs text-slate-500 mb-1.5 font-bold uppercase tracking-wider flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-slate-400" /> Category
            </label>
            <button
              onClick={() => {
                setCatOpen(!catOpen);
                setQualOpen(false);
                setStateOpen(false);
                setSectorOpen(false);
              }}
              className={`w-full bg-slate-50 border ${catOpen ? "border-blue-500/50 ring-1 ring-blue-500/10" : "border-slate-200"} rounded-xl py-2.5 px-3.5 text-left text-sm text-slate-700 flex justify-between items-center hover:border-slate-300 hover:bg-slate-100/50 transition duration-200 cursor-pointer`}
            >
              <span className="truncate">{selectedCategory || "All Categories"}</span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${catOpen ? "transform rotate-180 text-blue-600" : ""}`} />
            </button>
            {catOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
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
                    className={`w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-sm flex items-center justify-between transition cursor-pointer ${
                      (selectedCategory === cat || (cat === "All Categories" && !selectedCategory)) 
                        ? "text-blue-600 font-semibold bg-blue-50/50" 
                        : "text-slate-700"
                    }`}
                  >
                    <span>{cat}</span>
                    {(selectedCategory === cat || (cat === "All Categories" && !selectedCategory)) && (
                      <Check className="h-4 w-4 text-blue-600" />
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
            <label className="block text-xs text-slate-500 mb-1.5 font-bold uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Job Sector
            </label>
            <button
              onClick={() => {
                setSectorOpen(!sectorOpen);
                setCatOpen(false);
                setQualOpen(false);
                setStateOpen(false);
              }}
              className={`w-full bg-slate-50 border ${sectorOpen ? "border-blue-500/50 ring-1 ring-blue-500/10" : "border-slate-200"} rounded-xl py-2.5 px-3.5 text-left text-sm text-slate-700 flex justify-between items-center hover:border-slate-300 hover:bg-slate-100/50 transition duration-200 cursor-pointer`}
            >
              <span className="truncate">{selectedSector || "All Sectors"}</span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${sectorOpen ? "transform rotate-180 text-blue-600" : ""}`} />
            </button>
            {sectorOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
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
                    className={`w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-sm flex items-center justify-between transition cursor-pointer ${
                      (selectedSector === sec || (sec === "All Sectors" && !selectedSector)) 
                        ? "text-blue-600 font-semibold bg-blue-50/50" 
                        : "text-slate-700"
                    }`}
                  >
                    <span>{sec}</span>
                    {(selectedSector === sec || (sec === "All Sectors" && !selectedSector)) && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Qualification Filter */}
        <div className="relative">
          <label className="block text-xs text-slate-500 mb-1.5 font-bold uppercase tracking-wider flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5 text-slate-400" /> Education
          </label>
          <button
            onClick={() => {
              setQualOpen(!qualOpen);
              setCatOpen(false);
              setStateOpen(false);
              setSectorOpen(false);
            }}
            className={`w-full bg-slate-50 border ${qualOpen ? "border-blue-500/50 ring-1 ring-blue-500/10" : "border-slate-200"} rounded-xl py-2.5 px-3.5 text-left text-sm text-slate-700 flex justify-between items-center hover:border-slate-300 hover:bg-slate-100/50 transition duration-200 cursor-pointer`}
          >
            <span className="truncate">{selectedQualification || "All Qualifications"}</span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${qualOpen ? "transform rotate-180 text-blue-600" : ""}`} />
          </button>
          {qualOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
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
                  className={`w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-sm flex items-center justify-between transition cursor-pointer ${
                    (selectedQualification === qual || (qual === "All Qualifications" && !selectedQualification)) 
                      ? "text-blue-600 font-semibold bg-blue-50/50" 
                      : "text-slate-700"
                  }`}
                >
                  <span>{qual}</span>
                  {(selectedQualification === qual || (qual === "All Qualifications" && !selectedQualification)) && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* State Filter */}
        <div className="relative">
          <label className="block text-xs text-slate-500 mb-1.5 font-bold uppercase tracking-wider flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" /> State / Region
          </label>
          <button
            onClick={() => {
              setStateOpen(!stateOpen);
              setQualOpen(false);
              setCatOpen(false);
              setSectorOpen(false);
            }}
            className={`w-full bg-slate-50 border ${stateOpen ? "border-blue-500/50 ring-1 ring-blue-500/10" : "border-slate-200"} rounded-xl py-2.5 px-3.5 text-left text-sm text-slate-700 flex justify-between items-center hover:border-slate-300 hover:bg-slate-100/50 transition duration-200 cursor-pointer`}
          >
            <span className="truncate">{selectedState || "All States"}</span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${stateOpen ? "transform rotate-180 text-blue-600" : ""}`} />
          </button>
          {stateOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
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
                  className={`w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-sm flex items-center justify-between transition cursor-pointer ${
                    (selectedState === st || (st === "All States" && !selectedState)) 
                      ? "text-blue-600 font-semibold bg-blue-50/50" 
                      : "text-slate-700"
                  }`}
                >
                  <span>{st}</span>
                  {(selectedState === st || (st === "All States" && !selectedState)) && (
                    <Check className="h-4 w-4 text-blue-600" />
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
