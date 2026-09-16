export type Sex = 'MALE' | 'FEMALE'

export type User = {
  id: string
  phone: string
  displayName: string | null
  avatarUrl: string | null
  city: string | null
  role: 'USER' | 'MODERATOR' | 'ADMIN'
  verificationStatus: string
  locale?: string
}

export type Pet = {
  id: string
  ownerId: string
  name: string
  sex: Sex
  ageYears: number
  bio: string | null
  city: string
  isPublished: boolean
  photos: { id: string; url: string }[]
  breed: { id: string; nameRu: string } | null
  badges: {
    healthVerified: boolean
    pedigreeVerified: boolean
    dnaTested: boolean
  }
  completeness: number
  distanceKm?: number
  score?: number
  breedingStatus?: string
  searchPreference?: SearchPreference
}

export type SearchPreference = {
  radiusKm?: number
  sex?: Sex | null
  breedIds?: string[]
  verifiedOnly?: boolean
  healthVerified?: boolean
  pedigreeVerified?: boolean
  dnaTested?: boolean
}

export type MatchItem = {
  id: string
  chatId: string
  myPet: Pet
  otherPet: Pet
}

export type ChatItem = {
  id: string
  matchId?: string
  otherPet: Pet
  lastMessage: { text: string | null } | null
}

export type Message = {
  id: string
  senderId: string
  text: string | null
}

export type Species = {
  id: string
  nameRu: string
  breeds: { id: string; nameRu: string }[]
}

export type DocumentItem = {
  id: string
  type: string
  status: string
  issuer?: string | null
  pet?: { name: string }
}

export type BreedingRequest = {
  id: string
  status: string
  note?: string | null
  proposedAt?: string | null
  matchId: string
  senderPet: { id: string; name: string; ownerId: string }
  receiverPet: { id: string; name: string; ownerId: string }
}

export type BreedingEvent = {
  id: string
  eventType: string
  scheduledAt?: string | null
  completedAt?: string | null
  notes?: string | null
  partnerPet?: { name: string } | null
}
