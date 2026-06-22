"use client";

import { Check, ChevronDown, Filter } from "lucide-react";
import { useState } from "react";

interface FilterBarProps {
  selectedQualification: string;
  selectedState: string;
  selectedCategory: string;
  selectedSector?: string;
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
  onFilterChange
}: FilterBarProps) {
  const [qualOpen, setQualOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [sectorOpen, setSectorOpen] = useState(false);

  return (
    <div className="bg-[#1e293b]/50 border border-slate-800 rounded-xl p-4 mb-6 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3 text-slate-300 font-semibold text-sm">
        <Filter className="h-4 w-4 text-emerald-400" />
        Filter Notifications
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div className="relative">
          <label className="block text-xs text-slate-400 mb-1 font-medium">Category</label>
          <button
            onClick={() => {
              setCatOpen(!catOpen);
              setQualOpen(false);
              setStateOpen(false);
              setSectorOpen(false);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-left text-sm text-slate-200 flex justify-between items-center hover:border-slate-700 transition"
          >
            {selectedCategory || "All Categories"}
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
          {catOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
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
                  className="w-full text-left py-2 px-3 hover:bg-slate-800 text-sm text-slate-300 flex items-center justify-between"
                >
                  {cat}
                  {(selectedCategory === cat || (cat === "All Categories" && !selectedCategory)) && (
                    <Check className="h-4 w-4 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sector Filter */}
        <div className="relative">
          <label className="block text-xs text-slate-400 mb-1 font-medium">Job Sector</label>
          <button
            onClick={() => {
              setSectorOpen(!sectorOpen);
              setCatOpen(false);
              setQualOpen(false);
              setStateOpen(false);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-left text-sm text-slate-200 flex justify-between items-center hover:border-slate-700 transition"
          >
            {selectedSector || "All Sectors"}
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
          {sectorOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
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
                  className="w-full text-left py-2 px-3 hover:bg-slate-800 text-sm text-slate-300 flex items-center justify-between"
                >
                  {sec}
                  {(selectedSector === sec || (sec === "All Sectors" && !selectedSector)) && (
                    <Check className="h-4 w-4 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Qualification Filter */}
        <div className="relative">
          <label className="block text-xs text-slate-400 mb-1 font-medium">Education Level</label>
          <button
            onClick={() => {
              setQualOpen(!qualOpen);
              setCatOpen(false);
              setStateOpen(false);
              setSectorOpen(false);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-left text-sm text-slate-200 flex justify-between items-center hover:border-slate-700 transition"
          >
            {selectedQualification || "All Qualifications"}
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
          {qualOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
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
                  className="w-full text-left py-2 px-3 hover:bg-slate-800 text-sm text-slate-300 flex items-center justify-between"
                >
                  {qual}
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
          <label className="block text-xs text-slate-400 mb-1 font-medium">State / Region</label>
          <button
            onClick={() => {
              setStateOpen(!stateOpen);
              setQualOpen(false);
              setCatOpen(false);
              setSectorOpen(false);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-left text-sm text-slate-200 flex justify-between items-center hover:border-slate-700 transition"
          >
            {selectedState || "All States"}
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
          {stateOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
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
                  className="w-full text-left py-2 px-3 hover:bg-slate-800 text-sm text-slate-300 flex items-center justify-between"
                >
                  {st}
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
