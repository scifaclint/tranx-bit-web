import React from "react";
import Image from "next/image";
export const ReviewCard = ({
  source = "Powersurge",
  sourceLogo = "https://via.placeholder.com/40",
  review = "This has been a lifesaver for our team—everything we need is right at our fingertips, and it helps us jump right into new projects.",
  authorName = "Nikolas Gibbons",
  authorTitle = "Product Designer, Powersurge",
  authorImage = "https://via.placeholder.com/60",
  isVerified = true,
}) => {
  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
      {/* Source Logo and Name */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">
            {source.charAt(0)}
          </span>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900">{source}</h3>
      </div>

      {/* Review Text */}
      <p className="text-gray-600 text-lg leading-relaxed mb-8">{review}</p>

      {/* Author Info */}
      <div className="flex items-center gap-4">
        <Image
          src={authorImage}
          alt={authorName}
          className="w-14 h-14 rounded-full object-cover"
          width={20}
          height={20}
        />
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-gray-900 font-semibold text-lg">
              {authorName}
            </h4>
            {isVerified && (
              <svg
                className="w-5 h-5 text-blue-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </div>
          <p className="text-gray-500 text-base">{authorTitle}</p>
        </div>
      </div>
    </div>
  );
};
