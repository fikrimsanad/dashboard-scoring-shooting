import "server-only";

type NextFetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

type ExternalApiRequestOptions = Omit<RequestInit, "body" | "headers" | "method"> & {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: HeadersInit;
  body?: BodyInit | Record<string, unknown>;
  next?: NextFetchOptions;
};

export type ExternalPost = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type LmsApiEndpoint = {
  methods: string[];
  uri: string;
  name: string | null;
  parameters: string[];
};

export type LmsApiEndpointsResponse = {
  status: "success";
  data: LmsApiEndpoint[];
};

export type LmsApiProdiklatSatdikItem = {
  id: number;
  satdik_id: number;
  nama_batch: string;
  is_active: number;
  theme_color: string;
  text_color: string;
};

export type LmsApiProdiklatSatdikResponse = {
  status: "success";
  data: LmsApiProdiklatSatdikItem[];
};

export type LmsApiCreateOrUpdateExamRequest = {
  external_exam_id: string;
  external_source?: string;
  external_context: string;
  batch_id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
};

export type LmsApiPushExamScoreItem = {
  participant_identifier?: string;
  user_id?: number;
  external_attempt_id?: string;
  score: number;
  feedback?: string | null;
  started_at?: string;
  finished_at?: string;
};

export type LmsApiPushExamScoreRequest = {
  finalized_at?: string;
  scores: LmsApiPushExamScoreItem[];
};

export type LmsApiExamBatch = {
  id: number;
  nama_batch: string;
};

export type LmsApiCreateOrUpdateExamData = {
  id: number;
  external_exam_id: string;
  external_source: string | null;
  external_context: string;
  type: "manual";
  title: string;
  description: string | null;
  batch: LmsApiExamBatch;
  learning_material: null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
};

export type LmsApiCreateOrUpdateExamResponse = {
  status: "success";
  message: "Exam created successfully." | "Exam updated successfully.";
  data: LmsApiCreateOrUpdateExamData;
};

export type LmsApiPushExamScoreSummary = {
  total: number;
  saved: number;
  failed: number;
};

export type LmsApiPushExamScoreSavedItem = {
  exam_attempt_id: number;
  user_id: number;
  participant_identifier: string;
  score: number;
};

export type LmsApiPushExamScoreErrorItem = {
  index: number;
  participant_identifier: string | null;
  user_id: number | null;
  message: string;
};

export type LmsApiPushExamScoreSuccessResponse = {
  status: "success";
  message: "Results processed successfully.";
  data: {
    exam: LmsApiCreateOrUpdateExamData;
    summary: LmsApiPushExamScoreSummary;
    saved: LmsApiPushExamScoreSavedItem[];
    errors: LmsApiPushExamScoreErrorItem[];
  };
};

export type LmsApiPushExamScorePartialSuccessResponse = {
  status: "partial_success";
  message: "Results processed with some errors.";
  data: {
    summary: LmsApiPushExamScoreSummary;
    saved: LmsApiPushExamScoreSavedItem[];
    errors: LmsApiPushExamScoreErrorItem[];
  };
};

export type LmsApiPushExamScoreResponse =
  | LmsApiPushExamScoreSuccessResponse
  | LmsApiPushExamScorePartialSuccessResponse;

export class ExternalApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly url: string,
    public readonly responseBody?: string,
  ) {
    super(message);
    this.name = "ExternalApiError";
  }
}

function getExternalApiConfig() {
  const baseUrl = process.env.EXTERNAL_API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "Missing EXTERNAL_API_BASE_URL. Define it in your environment before calling the external API adapter.",
    );
  }

  return {
    baseUrl,
    token: process.env.EXTERNAL_API_TOKEN,
  };
}

function buildHeaders(token: string | undefined, headers?: HeadersInit) {
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("accept")) {
    requestHeaders.set("accept", "application/json");
  }

  if (token && !requestHeaders.has("authorization")) {
    requestHeaders.set("authorization", `Bearer ${token}`);
  }

  return requestHeaders;
}

function buildBody(body: ExternalApiRequestOptions["body"], headers: Headers) {
  if (!body || body instanceof FormData || body instanceof URLSearchParams || typeof body === "string") {
    return body;
  }

  if (body instanceof Blob || body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return body;
  }

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return JSON.stringify(body);
}

export async function externalApiRequest<T>(
  path: string,
  { method = "GET", headers, body, ...options }: ExternalApiRequestOptions = {},
) {
  const { baseUrl, token } = getExternalApiConfig();
  const url = new URL(path, baseUrl);
  const requestHeaders = buildHeaders(token, headers);

  const response = await fetch(url, {
    ...options,
    method,
    headers: requestHeaders,
    body: buildBody(body, requestHeaders),
  });

  if (!response.ok) {
    const responseBody = await response.text();

    throw new ExternalApiError(
      `External API request failed with status ${response.status}`,
      response.status,
      url.toString(),
      responseBody,
    );
  }

  return (await response.json()) as T;
}

export function listExternalPosts(limit = 5) {
  const searchParams = new URLSearchParams({
    _limit: String(limit),
  });

  return externalApiRequest<ExternalPost[]>(`/posts?${searchParams.toString()}`, {
    next: {
      revalidate: 300,
      tags: ["external-posts"],
    },
  });
}

// Mengambil seluruh daftar endpoint yang tersedia di dalam sistem LMS API, termasuk metode HTTP, URI, nama (jika ada), dan parameter yang diperlukan untuk setiap endpoint.
export function lmsApiEndpoints() {
  return externalApiRequest<LmsApiEndpointsResponse>("/api/endpoints", {
    next: {
      revalidate: 300,
      tags: ["lms-api-endpoints"],
    },
  });
}

// Mengambil seluruh data Satuan Pendidikan (Satdik) yang terdaftar di dalam sistem LMS API
export function lmsApiSatdik() {
  return externalApiRequest<LmsApiEndpointsResponse>("/api/satdik", {
    next: {
      revalidate: 300,
      tags: ["lms-api-satdik"],
    },
  });
}

// Mengambil data program pendidikan dan pelatihan (Batch) yang aktif berdasarkan ID Satdik tertentu di dalam sistem LMS API.
// Endpoint ini memungkinkan pengguna untuk melihat program pendidikan dan pelatihan yang sedang berlangsung atau akan datang untuk satuan pendidikan tertentu.
export function lmsApiProdiklatSatdik(satdikId: number) {
  return externalApiRequest<LmsApiProdiklatSatdikResponse>(`/api/prodiklat/${satdikId}`, {
    next: {
      revalidate: 300,
      tags: ["lms-api-prodiklat-satdik"],
    },
  });
}

// Mengambil seluruh data Peserta (Serdik) yang terdaftar di dalam sebuah Prodiklat (Batch) tertentu.
// Endpoint ini memungkinkan pengguna untuk melihat daftar peserta yang mengikuti program pendidikan dan pelatihan tertentu berdasarkan ID Batch yang diberikan.
export function lmsApiPesertaProdiklatSatdik(batchId: number) {
  return externalApiRequest<LmsApiProdiklatSatdikResponse>(`/api/prodiklat/${batchId}/peserta`, {
    next: {
      revalidate: 300,
      tags: ["lms-api-prodiklat-satdik"],
    },
  });
}

// Mencari dan mengembalikan data lengkap Peserta Didik (Serdik) beserta informasi Satdik dan Prodiklat (Batch) yang sedang aktif, berdasarkan NRP (dari tabel profiles) atau NOSIS (dari tabel peserta_details)
// Endpoint ini memungkinkan pengguna untuk mencari peserta didik tertentu menggunakan identifier unik mereka (NRP atau NOSIS) dan mendapatkan informasi terkait satuan pendidikan dan program pendidikan yang sedang mereka ikuti.
export function lmsApiPesertaDidik(identifier: number) {
  return externalApiRequest<LmsApiProdiklatSatdikResponse>(`/api/peserta/${identifier}/peserta`, {
    next: {
      revalidate: 300,
      tags: ["lms-api-prodiklat-satdik"],
    },
  });
}

// Membuat atau memperbarui metadata ujian dari sistem eksternal. Ujian yang dibuat melalui endpoint ini otomatis menggunakan tipe manual, karena pengerjaan ujian dilakukan di luar LMS dan LMS hanya menerima nilai akhir.
// Endpoint ini idempotent berdasarkan external_exam_id: jika ID eksternal sudah pernah dikirim, data ujian akan diperbarui, bukan dibuat ulang.
export function lmsApiBuatUjian(payload: LmsApiCreateOrUpdateExamRequest) {
  return externalApiRequest<LmsApiCreateOrUpdateExamResponse>("/api/integrations/exams", {
    method: "POST",
    body: payload,
    next: {
      revalidate: 300,
      tags: ["lms-api-buat-ujian"],
    },
  });
}

// Mengirim nilai akhir peserta untuk ujian eksternal yang sudah dibuat melalui endpoint /api/integrations/exams.
// Endpoint ini melakukan upsert nilai berdasarkan kombinasi external_exam_id + peserta. Jika nilai peserta yang sama dikirim ulang, nilai lama akan diperbarui.
export function lmsApiPushNilaiUjian(externalExamId: string, payload: LmsApiPushExamScoreRequest) {
  return externalApiRequest<LmsApiPushExamScoreResponse>(`/api/integrations/exams/${externalExamId}/results`, {
    method: "POST",
    body: payload,
    next: {
      revalidate: 300,
      tags: ["lms-api-push-nilai-ujian"],
    },
  });
}