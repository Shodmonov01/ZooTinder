export type Sex = 'MALE' | 'FEMALE';
export type BreedingStatus = 'LOOKING' | 'PAUSED' | 'NOT_AVAILABLE';

export type User = {
  id: string;
  phone: string;
  displayName: string | null;
  avatarUrl: string | null;
  city: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  verificationStatus: string;
  petsCount?: number;
};

export type Pet = {
  id: string;
  ownerId: string;
  name: string;
  sex: Sex;
  birthDate: string;
  ageYears: number;
  weightKg: number | null;
  color: string | null;
  bio: string | null;
  temperament: string[];
  breedingStatus: BreedingStatus;
  city: string;
  latitude: number;
  longitude: number;
  isPublished: boolean;
  photos: { id: string; url: string; sortOrder: number }[];
  breed: { id: string; name: string; nameRu: string; mixed: boolean } | null;
  species: { id: string; code: string; nameRu: string } | null;
  owner: { id: string; displayName: string | null; city: string | null } | null;
  badges: {
    healthVerified: boolean;
    pedigreeVerified: boolean;
    dnaTested: boolean;
    ownerVerified: boolean;
  };
  completeness: number;
  distanceKm?: number;
  score?: number;
};

export type MatchItem = {
  id: string;
  createdAt: string;
  chatId: string;
  myPet: Pet;
  otherPet: Pet;
};

export type ChatItem = {
  id: string;
  matchId: string;
  otherPet: Pet;
  lastMessage: { id: string; text: string | null; createdAt: string } | null;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  text: string | null;
  attachmentUrl: string | null;
  createdAt: string;
};

export type Breed = {
  id: string;
  speciesId: string;
  name: string;
  nameRu: string;
  mixed: boolean;
};

export type Species = {
  id: string;
  code: string;
  nameRu: string;
  breeds: Breed[];
};
