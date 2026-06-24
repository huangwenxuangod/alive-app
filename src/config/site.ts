export const siteConfig = {
  name: '活着 ALIVE',
  tagline: '30天赚钱生存挑战',
  motto: 'Talk is cheap. Show me your money.',
  description: '一个30天赚钱生存挑战游戏，用真实的收入数据证明你还活着。',
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://alive.app',
  ogImage: '/og.png',
  links: {
    twitter: 'https://twitter.com/alive_app',
    discord: 'https://discord.gg/alive',
  },
  auth: {
    enableCredentialLogin: true,
    enableGithubLogin: !!process.env.GITHUB_CLIENT_ID,
    enableGoogleLogin: !!process.env.GOOGLE_CLIENT_ID,
  },
  challenge: {
    maxDays: 30,
    defaultTargets: [1, 10, 100, 1000], // 单位：元
    warningDays: 2, // 连续N天未提交 → warning
    dangerDays: 3, // 连续N天未提交 → danger
  },
  credits: {
    registerGift: 10,
    submitCost: 1,
    aiSuggestCost: 2,
    shareReward: 1,
    shareRewardDailyLimit: 3,
  },
} as const;

export type SiteConfig = typeof siteConfig;
