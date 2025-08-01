FROM node:22-alpine AS base

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Declare DOPPLER_TOKEN as a build argument
ARG DOPPLER_TOKEN

# Check if DOPPLER_TOKEN is set, fail build if not
RUN test -n "$DOPPLER_TOKEN" || (echo "Error: Build-time argument DOPPLER_TOKEN is required." >&2 && exit 1)

# --- Set ENV var from ARG for Doppler --- 
ENV DOPPLER_TOKEN=$DOPPLER_TOKEN

# --- Check if token contains the literal string 'DOPPLER_TOKEN' (should not) ---
RUN echo "$DOPPLER_TOKEN" | grep -q 'DOPPLER_TOKEN' && \
    (echo "Error: DOPPLER_TOKEN variable appears to contain the literal string 'DOPPLER_TOKEN'. Substitution likely failed." >&2; exit 1) || \
    echo "DOPPLER_TOKEN check passed (does not contain 'DOPPLER_TOKEN')."
# --- END Check ---

# --- DEBUG: Log partial token (REMOVE FOR PRODUCTION) ---
# Use cut for better shell portability
RUN echo "DOPPLER_TOKEN (start): $(echo "$DOPPLER_TOKEN" | cut -c1-4)..."
RUN echo "DOPPLER_TOKEN (end): ...$(echo "$DOPPLER_TOKEN" | cut -c $((${#DOPPLER_TOKEN}-3))-${#DOPPLER_TOKEN})"
# --- END DEBUG ---

# Install builder dependencies including those for Doppler
RUN apk add --no-cache curl gnupg libc6-compat

# Install Doppler CLI in builder stage
RUN curl -Ls https://cli.doppler.com/install.sh | sh -s -- --no-package-manager --install-path /usr/local/bin

# Copy package files and lockfile first
COPY package.json pnpm-lock.yaml* ./
# Install dependencies AFTER Doppler CLI is available (in case of private packages via Doppler)
# Doppler token is available via ARG, doppler login/setup isn't used here
# Mount pnpm cache - REMOVING
# RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store/v3 \
#     corepack enable pnpm && pnpm i --frozen-lockfile
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Copy the rest of the source code NOW
COPY . .

# Clear potentially stale Next.js cache - REMOVED as we use build cache mount below
# RUN rm -rf .next

# Next.js telemetry config
ENV NEXT_TELEMETRY_DISABLED 1

# Run the build using Doppler
# DOPPLER_TOKEN is available via the ARG declared above
# Mount Next.js build cache - REMOVING
# RUN --mount=type=cache,id=nextjs,target=/app/.next/cache \
#    corepack enable pnpm && doppler run -- pnpm run build
RUN corepack enable pnpm && doppler run -- pnpm run build

# --- Production Stage ---

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Install only necessary runtime packages (Doppler needed for CMD)
RUN apk add --no-cache curl libc6-compat gnupg

# Install Doppler CLI for Alpine (again, needed for CMD)
RUN curl -Ls https://cli.doppler.com/install.sh | sh -s -- --no-package-manager --install-path /usr/local/bin

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
# Prepend 'doppler run --' to inject secrets for runtime.
# It will automatically use the DOPPLER_TOKEN from the environment.
CMD doppler run -- node server.js -H 0.0.0.0