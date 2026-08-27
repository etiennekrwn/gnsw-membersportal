export const mockUsers = [
  {
    id: 1,
    name: 'Adaeze Okoye',
    email: 'adaeze@gns.ng',
    password: 'associate123',
    tier: 'ROLE_ASSOCIATE',
    tierLabel: 'Associate',
    tierShort: 'AGNS',
    initials: 'AO',
    joinDate: '2024-03-10',
    bio: 'Emerging speechwriter and rhetoric student.',
    articleMonthlyLimit: 3,
    dailyArticleLimit: 2,
  },
  {
    id: 2,
    name: 'Emeka Nwosu',
    email: 'emeka@gns.ng',
    password: 'partner123',
    tier: 'ROLE_MEMBER',
    tierLabel: 'Partner',
    tierShort: 'PGNS',
    initials: 'EN',
    joinDate: '2023-07-22',
    bio: 'Active speechwriting professional with 8 years experience.',
    articleMonthlyLimit: null,
    dailyArticleLimit: 2,
  },
  {
    id: 3,
    name: 'Dr. Funmi Adeyemi',
    email: 'funmi@gns.ng',
    password: 'fellow123',
    tier: 'ROLE_FELLOW',
    tierLabel: 'Fellow',
    tierShort: 'FGNS',
    initials: 'FA',
    joinDate: '2021-01-05',
    bio: 'Senior institutional authority and executive press secretary.',
    articleMonthlyLimit: null,
    dailyArticleLimit: 2,
  },
]

export const TIER_LEVELS = {
  ROLE_ASSOCIATE: 1,
  ROLE_MEMBER: 2,
  ROLE_FELLOW: 3,
}

export function canAccessTier(userTier, requiredTier) {
  return (TIER_LEVELS[userTier] || 0) >= (TIER_LEVELS[requiredTier] || 0)
}