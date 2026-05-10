import { ExternalApiError, listExternalPosts, type ExternalPost } from "@/lib/lms-api/client";

async function getPostsPreview() {
  try {
    const posts = await listExternalPosts(4);

    return {
      posts,
      error: null,
    };
  } catch (error) {
    if (error instanceof ExternalApiError || error instanceof Error) {
      return {
        posts: [] as ExternalPost[],
        error: error.message,
      };
    }

    throw error;
  }
}

export default async function Home() {
  const { posts, error } = await getPostsPreview();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-14 sm:px-10">
      <section className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
        <span className="text-sm font-medium text-muted-foreground">Next.js external API adapter</span>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Simpan adapter API eksternal di server, bukan di Client Component.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
          Contoh ini memakai adapter server-only di <code>lib/external-api/client.ts</code>, lalu
          dipakai langsung oleh Server Component dan tersedia juga lewat Route Handler di
          <code> /api/external/posts</code> untuk kebutuhan browser-side fetch.
        </p>
      </section>

      <section className="grid gap-4 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Preview data dari external API</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Data ini diambil pada Server Component memakai adapter yang sama dengan route proxy.
            </p>
          </div>
          <a
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            href="/api/external/posts?limit=3"
            target="_blank"
            rel="noreferrer"
          >
            Buka route handler
          </a>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-border bg-background p-5">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Post #{post.id}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-balance">{post.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 rounded-3xl border border-border bg-card p-8 shadow-sm md:grid-cols-3">
        <div>
          <h2 className="text-lg font-semibold">Konvensi</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Simpan base URL, token, mapping response, dan error handling di satu adapter yang kecil dan
            typed.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Keamanan</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Pakai <code>server-only</code> untuk mencegah import ke Client Component dan hindari expose
            secret ke browser.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Integrasi</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Kalau UI bisa dirender di server, panggil adapter langsung. Kalau butuh fetch dari browser,
            buat Route Handler sebagai BFF tipis.
          </p>
        </div>
      </section>
    </main>
  );
}
