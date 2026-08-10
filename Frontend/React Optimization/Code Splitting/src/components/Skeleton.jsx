import React from "react";

function Skeleton() {
  return (
    <div className="animate-pulse bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      {/* Avatar + User Info */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gray-300" />

        <div className="flex-1">
          {/* Name */}
          <div className="h-5 bg-gray-300 rounded w-1/2 mb-2" />

          {/* Email */}
          <div className="h-4 bg-gray-300 rounded w-3/4" />
        </div>
      </div>

      {/* Details */}
      <div className="mt-5 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-full" />
        <div className="h-4 bg-gray-300 rounded w-5/6" />
        <div className="h-4 bg-gray-300 rounded w-2/3" />
      </div>

      {/* Button */}
      <div className="mt-5 h-10 bg-gray-300 rounded-lg w-full" />
    </div>
  );
}

export default Skeleton;
