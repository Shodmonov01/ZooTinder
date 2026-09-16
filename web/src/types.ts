export type Sex = 'MALE' | 'FEMALE'

export type User = {
  id: string
  phone: string
  displayName: string | null
  avatarUrl: string | null
  city: string | null
  role: 'USER' | 'MODERATOR' | 'ADMIN'
  verificationStatus: string
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
}

export type MatchItem = {
  id: string
  chatId: string
  otherPet: Pet
}

export type ChatItem = {
  id: string
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
