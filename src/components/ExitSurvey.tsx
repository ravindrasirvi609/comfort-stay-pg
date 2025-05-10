import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Star } from "lucide-react";

interface ExitSurveyProps {
  userId: string;
  onComplete?: (surveyData?: SurveyData) => void;
  onCancel?: () => void;
  isAdmin?: boolean;
}

interface SurveyData {
  overallExperience: number;
  cleanliness: number;
  facilities: number;
  staff: number;
  foodQuality: number;
  valueForMoney: number;
  wouldRecommend: boolean;
  likedMost: string;
  improvements: string;
  exitReason: string;
  otherComments: string;
}

const ExitSurvey: React.FC<ExitSurveyProps> = ({
  userId,
  onComplete,
  onCancel,
  isAdmin = false,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    overallExperience: 0,
    cleanliness: 0,
    facilities: 0,
    staff: 0,
    foodQuality: 0,
    valueForMoney: 0,
    wouldRecommend: false,
    likedMost: "",
    improvements: "",
    exitReason: "",
    otherComments: "",
  });

  const handleRatingChange = (category: keyof SurveyData, value: number) => {
    setSurveyData((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setSurveyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSurveyData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // If user is currently checking out (not submitting survey later)
      if (isAdmin) {
        // If admin is collecting the survey, return the data to be included in checkout
        if (onComplete) {
          onComplete(surveyData);
        }
        return;
      }

      // For users submitting survey after checkout
      const response = await axios.put(`/api/users/${userId}/checkout`, {
        exitSurvey: surveyData,
      });

      if (response.data.success) {
        toast.success("Thank you for your feedback!");
        if (onComplete) {
          onComplete();
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(response.data.message || "Failed to submit feedback");
      }
    } catch (error: any) {
      console.error("Error submitting exit survey:", error);
      toast.error(
        error.response?.data?.message || "Error submitting exit survey"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const StarRating = ({
    name,
    value,
    onChange,
  }: {
    name: string;
    value: number;
    onChange: (value: number) => void;
  }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={24}
            className={`cursor-pointer ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Exit Survey
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
        We value your feedback! Please share your experience to help us improve.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Rating sections */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Please rate your experience (1-5 stars)
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 dark:text-gray-300">
                  Overall Experience
                </label>
                <StarRating
                  name="overallExperience"
                  value={surveyData.overallExperience}
                  onChange={(value) =>
                    handleRatingChange("overallExperience", value)
                  }
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 dark:text-gray-300">
                  Cleanliness
                </label>
                <StarRating
                  name="cleanliness"
                  value={surveyData.cleanliness}
                  onChange={(value) => handleRatingChange("cleanliness", value)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 dark:text-gray-300">
                  Facilities
                </label>
                <StarRating
                  name="facilities"
                  value={surveyData.facilities}
                  onChange={(value) => handleRatingChange("facilities", value)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 dark:text-gray-300">
                  Staff Behavior
                </label>
                <StarRating
                  name="staff"
                  value={surveyData.staff}
                  onChange={(value) => handleRatingChange("staff", value)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 dark:text-gray-300">
                  Food Quality
                </label>
                <StarRating
                  name="foodQuality"
                  value={surveyData.foodQuality}
                  onChange={(value) => handleRatingChange("foodQuality", value)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 dark:text-gray-300">
                  Value for Money
                </label>
                <StarRating
                  name="valueForMoney"
                  value={surveyData.valueForMoney}
                  onChange={(value) =>
                    handleRatingChange("valueForMoney", value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="wouldRecommend"
              name="wouldRecommend"
              checked={surveyData.wouldRecommend}
              onChange={handleCheckboxChange}
              className="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <label
              htmlFor="wouldRecommend"
              className="text-gray-700 dark:text-gray-300"
            >
              I would recommend this PG to others
            </label>
          </div>

          {/* Exit reason */}
          <div>
            <label
              htmlFor="exitReason"
              className="block text-gray-700 dark:text-gray-300 mb-1"
            >
              Primary reason for leaving
            </label>
            <select
              id="exitReason"
              name="exitReason"
              value={surveyData.exitReason}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select a reason</option>
              <option value="End of work/study">End of work/study</option>
              <option value="Relocating to different city">
                Relocating to different city
              </option>
              <option value="Found own accommodation">
                Found own accommodation
              </option>
              <option value="Found better PG">Found better PG</option>
              <option value="Cost concerns">Cost concerns</option>
              <option value="Dissatisfied with facilities">
                Dissatisfied with facilities
              </option>
              <option value="Personal reasons">Personal reasons</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Liked most */}
          <div>
            <label
              htmlFor="likedMost"
              className="block text-gray-700 dark:text-gray-300 mb-1"
            >
              What did you like most about your stay?
            </label>
            <textarea
              id="likedMost"
              name="likedMost"
              value={surveyData.likedMost}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            ></textarea>
          </div>

          {/* Improvements */}
          <div>
            <label
              htmlFor="improvements"
              className="block text-gray-700 dark:text-gray-300 mb-1"
            >
              What could we improve?
            </label>
            <textarea
              id="improvements"
              name="improvements"
              value={surveyData.improvements}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            ></textarea>
          </div>

          {/* Additional comments */}
          <div>
            <label
              htmlFor="otherComments"
              className="block text-gray-700 dark:text-gray-300 mb-1"
            >
              Any other comments or suggestions?
            </label>
            <textarea
              id="otherComments"
              name="otherComments"
              value={surveyData.otherComments}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-2 justify-end mt-6">
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {isAdmin ? "Cancel" : "Skip for Now"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition disabled:bg-pink-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExitSurvey;
