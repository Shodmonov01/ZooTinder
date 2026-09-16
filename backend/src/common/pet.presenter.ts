import {
  BreedingStatus,
  DocumentType,
  Pet,
  PetDocument,
  PetPhoto,
  VerificationStatus,
} from '@prisma/client';
import { ageYears } from './geo';

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

export type PetWithRelations = Pet & {
  photos: PetPhoto[];
  documents?: PetDocument[];
  breed?: { id: string; name: string; nameRu: string; mixed: boolean } | null;
  species?: { id: string; code: string; nameRu: string };
  owner?: {
    id: string;
    displayName: string | null;
    city: string | null;
    verificationStatus: VerificationStatus;
  };
};

export function isDocumentVerified(doc: PetDocument, now = new Date()): boolean {
  if (doc.status !== VerificationStatus.VERIFIED) {
    return false;
  }
  if (doc.expiresAt && doc.expiresAt < now) {
    return false;
  }
  return true;
}

export function petBadges(pet: PetWithRelations) {
  const documents = pet.documents ?? [];
  const healthVerified = documents.some(
    (doc) =>
      isDocumentVerified(doc) &&
      (doc.type === DocumentType.HEALTH_CERTIFICATE ||
        doc.type === DocumentType.VACCINATION),
  );
  const pedigreeVerified = documents.some(
    (doc) => isDocumentVerified(doc) && doc.type === DocumentType.PEDIGREE,
  );
  const dnaTested = documents.some(
    (doc) => isDocumentVerified(doc) && doc.type === DocumentType.DNA_TEST,
  );

  return {
    healthVerified,
    pedigreeVerified,
    dnaTested,
    ownerVerified:
      pet.owner?.verificationStatus === VerificationStatus.VERIFIED,
  };
}

export function profileCompleteness(pet: PetWithRelations): number {
  const checks = [
    Boolean(pet.name),
    Boolean(pet.speciesId),
    Boolean(pet.sex),
    Boolean(pet.birthDate),
    Boolean(pet.city),
    (pet.photos?.length ?? 0) >= 1,
    Boolean(pet.weightKg),
    Boolean(pet.bio),
    (pet.photos?.length ?? 0) >= 3,
    (pet.documents?.length ?? 0) >= 1,
    (asStringArray(pet.temperament).length ?? 0) >= 1,
    Boolean(pet.color),
  ];
  return Math.round((100 * checks.filter(Boolean).length) / checks.length);
}

export function canPublish(pet: PetWithRelations): boolean {
  return Boolean(
    pet.speciesId &&
      pet.sex &&
      pet.birthDate &&
      pet.city &&
      (pet.photos?.length ?? 0) >= 1,
  );
}

export function serializePet(
  pet: PetWithRelations,
  extras: { distanceKm?: number; score?: number } = {},
) {
  const badges = petBadges(pet);
  return {
    id: pet.id,
    ownerId: pet.ownerId,
    name: pet.name,
    sex: pet.sex,
    birthDate: pet.birthDate,
    ageYears: Number(ageYears(pet.birthDate).toFixed(1)),
    weightKg: pet.weightKg ? Number(pet.weightKg) : null,
    heightCm: pet.heightCm ? Number(pet.heightCm) : null,
    color: pet.color,
    bio: pet.bio,
    temperament: asStringArray(pet.temperament),
    breedingStatus: pet.breedingStatus,
    city: pet.city,
    latitude: pet.latitude,
    longitude: pet.longitude,
    isPublished: pet.isPublished,
    photos: [...pet.photos]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((photo) => ({
        id: photo.id,
        url: photo.url,
        sortOrder: photo.sortOrder,
      })),
    breed: pet.breed
      ? {
          id: pet.breed.id,
          name: pet.breed.name,
          nameRu: pet.breed.nameRu,
          mixed: pet.breed.mixed,
        }
      : null,
    species: pet.species
      ? {
          id: pet.species.id,
          code: pet.species.code,
          nameRu: pet.species.nameRu,
        }
      : null,
    owner: pet.owner
      ? {
          id: pet.owner.id,
          displayName: pet.owner.displayName,
          city: pet.owner.city,
        }
      : null,
    badges,
    completeness: profileCompleteness(pet),
    distanceKm:
      extras.distanceKm !== undefined
        ? Number(extras.distanceKm.toFixed(1))
        : undefined,
    score: extras.score,
    availableInDiscovery:
      pet.isPublished && pet.breedingStatus !== BreedingStatus.NOT_AVAILABLE,
  };
}

export const DEFAULT_RANKING_WEIGHTS = {
  breed: 0.3,
  distance: 0.2,
  age: 0.1,
  size: 0.05,
  pedigree: 0.1,
  health: 0.15,
  dna: 0.1,
};
