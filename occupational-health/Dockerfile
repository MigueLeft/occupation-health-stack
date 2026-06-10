FROM node:22-alpine AS builder

# Pinear pnpm al major 10 (compatible con lockfileVersion 9.0)
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# No usar --frozen-lockfile: sharp necesita resolver su binario nativo por plataforma (linux-musl en Alpine)
RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm run build

RUN pnpm run db:generate

# Eliminar devDependencies antes de copiar al stage final
RUN pnpm prune --prod

FROM node:22-alpine AS production

RUN apk add --no-cache postgresql17-client

WORKDIR /app

COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY migrate.mjs sync-journal.mjs ./

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
