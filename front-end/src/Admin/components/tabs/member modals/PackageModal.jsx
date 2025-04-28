"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import PackageOption from "./PackageOption";
import ConfirmationModal from "./ConfirmationModal";

export default function PackageModal({ isOpen, onClose, member }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState("group");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPackage = (packageType, duration, price, gender) => {
    setSelectedPackage({
      type: packageType,
      duration,
      price,
      gender,
    });
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      // Get the basic duration components
      const durationValue = selectedPackage.duration.split(" ")[0]; // Get the number part
      const durationUnit = selectedPackage.duration.split(" ")[1].toLowerCase(); // Get the unit part

      // Handle special cases for certain packages
      let formattedDuration;

      // Special case: Personalized Package - 6 Month (add 15 days free)
      if (
        selectedPackage.type === "Personalized Package" &&
        selectedPackage.duration === "6 Month"
      ) {
        formattedDuration = "6m15d";
      }
      // Special case: Personalized Package - 12 Month (add 1 month free)
      else if (
        selectedPackage.type === "Personalized Package" &&
        selectedPackage.duration === "12 Month"
      ) {
        formattedDuration = "1y1m";
      }
      // Special case: Individual Package - 6 Month (add 15 days free)
      else if (
        selectedPackage.type === "Individual Package" &&
        selectedPackage.duration === "6 Month"
      ) {
        formattedDuration = "6m15d";
      }
      // Special case: Individual Package - 12 Month (add 1 month free)
      else if (
        selectedPackage.type === "Individual Package" &&
        selectedPackage.duration === "12 Month"
      ) {
        formattedDuration = "1y1m";
      }
      // Default case: standard duration formatting
      else {
        if (durationUnit.startsWith("month")) {
          formattedDuration = `${durationValue}m`;
        } else if (
          durationUnit.startsWith("year") ||
          durationUnit.startsWith("12 month")
        ) {
          formattedDuration = `${durationValue}y`;
        } else if (durationUnit.startsWith("day")) {
          formattedDuration = `${durationValue}d`;
        } else if (durationUnit.startsWith("week")) {
          formattedDuration = `${durationValue}w`;
        } else if (durationUnit.startsWith("hour")) {
          formattedDuration = `${durationValue}h`;
        }
      }

      // Remove commas from price and convert to number
      const cleanAmount = selectedPackage.price.replace(/,/g, "");

      // Prepare the data to send
      const paymentData = {
        userId: member.id,
        planTitle: `${selectedPackage.type} - ${selectedPackage.duration}`,
        amount: Number(cleanAmount),
        gender: selectedPackage.gender,
        duration: formattedDuration,
      };

      console.log("Sending payment data:", paymentData);

      // Send the data to the API
      const response = await axios.post("payment/adminPayment", paymentData);

      console.log("Payment successful:", response.data);

      // Show success message or redirect
      alert("Payment processed successfully!");

      onClose();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Error processing payment. Please try again.");
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const tabs = [
    { id: "group", label: "Group Package" },
    { id: "individual", label: "Individual Package" },
    { id: "family", label: "Family Package" },
    { id: "personalized", label: "Personalized Package" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-t-xl p-6 text-white">
          <h2 className="text-2xl font-bold">Membership Packages</h2>
          <p className="mt-1 opacity-90">Select a package for {member?.name}</p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Package content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {activeTab === "group" && (
            <div className="grid gap-6 md:grid-cols-3">
              <PackageOption
                title="3 Month"
                prices={{ men: "12,000", women: "10,500" }}
                member={member}
                onSelect={handleSelectPackage}
                packageType="Group Package"
                duration="3 Month"
              />
              <PackageOption
                title="6 Month"
                prices={{ men: "21,360", women: "18,690" }}
                member={member}
                onSelect={handleSelectPackage}
                packageType="Group Package"
                duration="6 Month"
              />
              <PackageOption
                title="12 Month"
                prices={{ men: "40,800", women: "35,700" }}
                member={member}
                onSelect={handleSelectPackage}
                packageType="Group Package"
                duration="12 Month"
                featured={true}
              />
            </div>
          )}

          {activeTab === "individual" && (
            <div className="grid gap-6 md:grid-cols-4">
              <PackageOption
                title="1 Month"
                prices={{ men: "4,000", women: "3,500" }}
                member={member}
                onSelect={handleSelectPackage}
                packageType="Individual Package"
                duration="1 Month"
              />
              <PackageOption
                title="3 Month"
                prices={{ men: "10,680", women: "9,345" }}
                member={member}
                onSelect={handleSelectPackage}
                packageType="Individual Package"
                duration="3 Month"
              />
              <PackageOption
                title="6 Month"
                prices={{ men: "20,400", women: "17,850" }}
                member={member}
                onSelect={handleSelectPackage}
                packageType="Individual Package"
                duration="6 Month"
              />
              <PackageOption
                title="12 Month"
                prices={{ men: "38,880", women: "34,020" }}
                member={member}
                onSelect={handleSelectPackage}
                packageType="Individual Package"
                duration="12 Month"
                featured={true}
              />
            </div>
          )}

          {activeTab === "family" && (
            <div className="grid gap-6 md:grid-cols-1">
              <PackageOption
                title="1 Month"
                prices={{ men: "4,000", women: "3,500" }}
                member={member}
                onSelect={handleSelectPackage}
                packageType="Family Package"
                duration="1 Month"
                featured={true}
              />
            </div>
          )}

          {activeTab === "personalized" && (
            <div className="grid gap-6 md:grid-cols-3">
              <PackageOption
                title="3 Month"
                prices={{ men: "18,690", women: "17,355" }}
                member={member}
                onSelect={handleSelectPackage}
                packageType="Personalized Package"
                duration="3 Month"
              />
              <PackageOption
                title="6 Month"
                prices={{ men: "35,700", women: "33,150" }}
                member={member}
                onSelect={handleSelectPackage}
                packageType="Personalized Package"
                duration="6 Month"
              />
              <PackageOption
                title="12 Month"
                prices={{ men: "68,040", women: "63,180" }}
                member={member}
                onSelect={handleSelectPackage}
                packageType="Personalized Package"
                duration="12 Month"
                featured={true}
              />
            </div>
          )}
        </div>
      </div>

      {showConfirmation && (
        <ConfirmationModal
          packageDetails={selectedPackage}
          member={member}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirmation}
        />
      )}
    </div>
  );
}
