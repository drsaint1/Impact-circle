import { NextRequest, NextResponse } from "next/server";
import {
  logThumbsFeedback,
  logStarRating,
  logMultiDimensionalFeedback,
} from "@/lib/opik/feedback";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { traceId, type, userId, metadata } = body;

    if (!traceId) {
      return NextResponse.json(
        { success: false, error: "traceId is required" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "thumbs":
        
        const { thumbsUp, comment } = body;
        result = await logThumbsFeedback({
          traceId,
          thumbsUp,
          comment,
          userId,
          metadata,
        });
        break;

      case "stars":
        
        const { stars, starComment } = body;
        if (stars < 1 || stars > 5) {
          return NextResponse.json(
            { success: false, error: "stars must be between 1 and 5" },
            { status: 400 }
          );
        }
        result = await logStarRating({
          traceId,
          stars,
          comment: starComment,
          userId,
          metadata,
        });
        break;

      case "multi":
        
        const { ratings, multiComment } = body;
        result = await logMultiDimensionalFeedback({
          traceId,
          ratings,
          comment: multiComment,
          userId,
          metadata,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown feedback type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Feedback API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}