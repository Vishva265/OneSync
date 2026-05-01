import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common"
import { PrismaClient, type Prisma } from "@prisma/client"

function buildRuntimeDatabaseUrl(rawUrl = process.env.DATABASE_URL) {
  const databaseUrl = rawUrl?.trim().replace(/^"|"$/g, "")
  if (!databaseUrl) return undefined

  try {
    const url = new URL(databaseUrl)
    const hostParts = url.hostname.split(".")
    const isNeonHost = url.hostname.endsWith(".neon.tech")
    const isNeonPooler = hostParts[0]?.endsWith("-pooler")

    if (isNeonHost && !isNeonPooler && hostParts[0]) {
      hostParts[0] = `${hostParts[0]}-pooler`
      url.hostname = hostParts.join(".")
    }

    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", process.env.PRISMA_CONNECTION_LIMIT || "5")
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", process.env.PRISMA_POOL_TIMEOUT || "20")
    }
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", process.env.PRISMA_CONNECT_TIMEOUT || "15")
    }

    return url.toString()
  } catch {
    return databaseUrl
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const url = buildRuntimeDatabaseUrl()
    const options: Prisma.PrismaClientOptions = url
      ? {
          datasources: {
            db: { url },
          },
        }
      : {}

    super(options)
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
