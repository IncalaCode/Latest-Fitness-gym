import { useState } from "react";

export default function PackageOption({
  title,
  prices,
  member,
  onSelect,
  packageType,
  duration,
  featured = false,
}) {
  const [selectedGender, setSelectedGender] = useState(
    member?.gender?.toLowerCase() === "female" ? "women" : "men"
  );

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
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedGender("men")}
              className={`rounded-full px-3 py-1 text-sm ${
                selectedGender === "men"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Men
            </button>
            <button
              onClick={() => setSelectedGender("women")}
              className={`rounded-full px-3 py-1 text-sm ${
                selectedGender === "women"
                  ? "bg-pink-100 text-pink-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Women
            </button>
          </div>
        </div>

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
