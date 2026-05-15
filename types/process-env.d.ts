declare const process: {
  env: Record<string, string | undefined> & {
    NODE_ENV: "development" | "production" | "test";
    EXTERNAL_API_BASE_URL: string;
    EXTERNAL_API_TOKEN?: string;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    SESSION_SECRET: string;
  };
};
