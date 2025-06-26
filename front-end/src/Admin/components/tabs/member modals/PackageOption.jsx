import { useState } from "react";

export default function PackageOption({
  title,
  prices,
  member,
  onSelect,
  packageType,
  duration,
  featured = false,
  accessLevel,
  benefits = [],
}) {
  const selectedGender = 'men';

  const handleSelect = () => {
    onSelect(packageType, duration, prices[selectedGender], selectedGender);
  };

  return (
    <div
      className={`relative rounded-xl border-2 ${
        featured
          ? "border-blue-500 shadow-lg shadow-blue-100"
          : "border-gray-200"
      } p-6 transition-all hover:shadow-md`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
          RECOMMENDED
        </div>
      )}

      <h3 className="text-xl font-bold">{title}</h3>
      <div className="mt-2 text-sm text-gray-600">
        <span className="font-semibold">Access Level:</span> {accessLevel || 'Full'}
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-semibold">Duration:</span> {duration}
          </div>
      {benefits && benefits.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {benefits.map((b, i) => (
            <span key={i} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {b}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 space-y-4">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{prices[selectedGender]}</span>
          <span className="ml-1 text-gray-500">Birr</span>
        </div>
        <button
          onClick={handleSelect}
          className={`mt-4 w-full rounded-lg py-3 font-medium text-white transition-colors ${
            featured
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-700 hover:bg-gray-800"
          }`}
        >
          Select Package
        </button>
      </div>
    </div>
  );
}
