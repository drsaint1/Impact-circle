"use client";

import { useState } from "react";

interface OpikFeedbackWidgetProps {
  traceId: string;
  type?: "thumbs" | "stars" | "multi";
  userId?: string;
  onSubmit?: (success: boolean) => void;
}

export function OpikFeedbackWidget({
  traceId,
  type = "thumbs",
  userId,
  onSubmit,
}: OpikFeedbackWidgetProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleThumbsFeedback(thumbsUp: boolean) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/opik/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traceId,
          type: "thumbs",
          thumbsUp,
          userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        onSubmit?.(true);
      } else {
        console.error("Feedback submission failed:", result.error);
        onSubmit?.(false);
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      onSubmit?.(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStarRating(stars: number) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/opik/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traceId,
          type: "stars",
          stars,
          userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        onSubmit?.(true);
      } else {
        console.error("Feedback submission failed:", result.error);
        onSubmit?.(false);
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      onSubmit?.(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-sm text-green-600 font-medium">
        ✓ Thanks for your feedback!
      </div>
    );
  }

  if (type === "thumbs") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Was this helpful?</span>
        <button
          onClick={() => handleThumbsFeedback(true)}
          disabled={isSubmitting}
          className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition-colors disabled:opacity-50"
        >
          👍 Yes
        </button>
        <button
          onClick={() => handleThumbsFeedback(false)}
          disabled={isSubmitting}
          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors disabled:opacity-50"
        >
          👎 No
        </button>
      </div>
    );
  }

  if (type === "stars") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Rate this response:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarRating(star)}
              disabled={isSubmitting}
              className="text-2xl hover:scale-110 transition-transform disabled:opacity-50"
            >
              ⭐
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}


export function ThumbsFeedback({
  traceId,
  userId,
}: {
  traceId: string;
  userId?: string;
}) {
  return <OpikFeedbackWidget traceId={traceId} type="thumbs" userId={userId} />;
}


export function StarRatingFeedback({
  traceId,
  userId,
}: {
  traceId: string;
  userId?: string;
}) {
  return <OpikFeedbackWidget traceId={traceId} type="stars" userId={userId} />;
}