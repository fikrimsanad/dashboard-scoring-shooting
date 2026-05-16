<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:node-docker-fallback-rules -->
# Running npm / Node.js Commands

Before running any `npm`, `npx`, `pnpm`, or `node` command, check whether the required binary is available locally:

```bash
command -v node || command -v npm || command -v pnpm
```

**If Node.js / npm / pnpm is NOT found on the local machine**, do NOT attempt to install them globally. Instead, run all commands through Docker using the project's existing `docker-compose.yml` or a plain `docker run` invocation:

```bash
# Example: run a pnpm command via Docker
docker run --rm -v "$PWD":/app -w /app node:lts pnpm install

# Example: run an npm script via docker-compose (if a service is defined)
docker compose run --rm web npm run build
```

Rules:
- Always prefer the local binary when available.
- Fall back to Docker only when the local binary is missing.
- Use the same Node.js major version specified in `package.json` (`engines.node`) or `Dockerfile` when choosing a Docker image tag.
- Do NOT install Node.js, npm, or pnpm on the host machine as part of any automated task.
<!-- END:node-docker-fallback-rules -->
