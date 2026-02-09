export const EMAIL_CONFIG = {
  MAX_ACTIVE_EMAILS: 30, // Maximum number of active emails
  POLL_INTERVAL: 10_000, // Polling interval in milliseconds
  DEFAULT_DAILY_SEND_LIMITS: {
    owner: 0,    // Owner 无限制
    admin: 5,    // Admin 每日5封
    member: 2,   // Member 每日2封
    guest: -1,   // Guest 禁止发件
  },
} as const

export type EmailConfig = typeof EMAIL_CONFIG 