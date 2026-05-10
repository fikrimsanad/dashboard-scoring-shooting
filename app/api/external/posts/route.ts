import type { NextRequest } from "next/server";

import { ExternalApiError, listExternalPosts } from "@/lib/lms-api/client";

export const revalidate = 300;

function parseLimit(value: string | null) {
  const fallback = 5;

  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 20) {
    return fallback;
  }

  return parsedValue;
}

export async function GET(request: NextRequest) {
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));

  try {
    const posts = await listExternalPosts(limit);

    return Response.json({
      data: posts,
      meta: {
        count: posts.length,
        source: "external-api",
      },
    });
  } catch (error) {
    if (error instanceof ExternalApiError) {
      return Response.json(
        {
          error: "Failed to fetch data from external API.",
          details: {
            status: error.status,
            url: error.url,
          },
        },
        {
          status: 502,
        },
      );
    }

    if (error instanceof Error) {
      return Response.json(
        {
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }

    return Response.json(
      {
        error: "Unexpected external API error.",
      },
      {
        status: 500,
      },
    );
  }
}