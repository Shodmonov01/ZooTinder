import {
  BreedingStatus,
  DocumentType,
  PrismaClient,
  Sex,
  UserRole,
  VerificationStatus,
} from '@prisma/client';
import { DEFAULT_RANKING_WEIGHTS } from '../src/common/pet.presenter';

const prisma = new PrismaClient();

async function main() {
  await prisma.like.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.breedingRequest.deleteMany();
  await prisma.breedingEvent.deleteMany();
  await prisma.match.deleteMany();
  await prisma.petPhoto.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.dNARecord.deleteMany();
  await prisma.pedigree.deleteMany();
  await prisma.petDocument.deleteMany();
  await prisma.searchPreference.deleteMany();
  await prisma.healthRecord.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.otpChallenge.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.block.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.breed.deleteMany();
  await prisma.species.deleteMany();
  await prisma.appSetting.deleteMany();

  const dog = await prisma.species.create({
    data: { code: 'DOG', nameRu: 'Собака', nameUz: 'It' },
  });

  const breeds = await Promise.all(
    [
      { name: 'Central Asian Shepherd', nameRu: 'Алабай', nameUz: 'Alabay', aliases: ['alabai', 'САО'] },
      { name: 'German Shepherd', nameRu: 'Немецкая овчарка', nameUz: 'Nemets ovcharkasi', aliases: ['GSD'] },
      { name: 'Labrador Retriever', nameRu: 'Лабрадор', nameUz: 'Labrador', aliases: [] },
      { name: 'Siberian Husky', nameRu: 'Хаски', nameUz: 'Haski', aliases: [] },
      { name: 'Yorkshire Terrier', nameRu: 'Йоркширский терьер', nameUz: 'Yorkshir', aliases: ['york'] },
      { name: 'Poodle', nameRu: 'Пудель', nameUz: 'Pudel', aliases: [] },
      { name: 'Rottweiler', nameRu: 'Ротвейлер', nameUz: 'Rottveyler', aliases: [] },
      { name: 'Mixed', nameRu: 'Метис', nameUz: 'Aralash', aliases: ['mixed', 'дворняжка'], mixed: true },
    ].map((breed) =>
      prisma.breed.create({
        data: { ...breed, mixed: 'mixed' in breed ? Boolean(breed.mixed) : false, speciesId: dog.id },
      }),
    ),
  );

  const byName = Object.fromEntries(breeds.map((breed) => [breed.nameRu, breed]));

  await prisma.appSetting.create({
    data: { key: 'ranking_weights', value: DEFAULT_RANKING_WEIGHTS },
  });

  const admin = await prisma.user.create({
    data: {
      phone: '+998900000000',
      displayName: 'Модератор',
      city: 'Toshkent',
      role: UserRole.ADMIN,
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });

  const malika = await prisma.user.create({
    data: {
      phone: '+998901111111',
      displayName: 'Малика',
      city: 'Toshkent',
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });
  const aziz = await prisma.user.create({
    data: {
      phone: '+998902222222',
      displayName: 'Азиз',
      city: 'Toshkent',
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });
  const nilufar = await prisma.user.create({
    data: {
      phone: '+998903333333',
      displayName: 'Нилуфар',
      city: 'Toshkent',
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });
  const javlon = await prisma.user.create({
    data: {
      phone: '+998904444444',
      displayName: 'Жавлон',
      city: 'Toshkent',
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });
  const dilnoza = await prisma.user.create({
    data: {
      phone: '+998905555555',
      displayName: 'Дильноза',
      city: 'Toshkent',
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });

  const pets = [
    {
      ownerId: malika.id,
      name: 'Лайло',
      breedId: byName['Алабай'].id,
      sex: Sex.FEMALE,
      birthDate: new Date('2022-04-12'),
      weightKg: 38,
      color: 'Палевый',
      bio: 'Спокойная алабайка, ищем проверенного партнёра в Ташкенте.',
      temperament: ['спокойная', 'охраняет', 'дружелюбная'],
      latitude: 41.3111,
      longitude: 69.2797,
      photo: 'https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&w=1200',
      verifiedDocs: true,
    },
    {
      ownerId: aziz.id,
      name: 'Барс',
      breedId: byName['Алабай'].id,
      sex: Sex.MALE,
      birthDate: new Date('2021-08-03'),
      weightKg: 52,
      color: 'Белый',
      bio: 'Племенной кобель, есть родословная и прививки.',
      temperament: ['уверенный', 'управляемый'],
      latitude: 41.2995,
      longitude: 69.2401,
      photo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&w=1200',
      verifiedDocs: true,
    },
    {
      ownerId: nilufar.id,
      name: 'Айла',
      breedId: byName['Немецкая овчарка'].id,
      sex: Sex.FEMALE,
      birthDate: new Date('2023-01-20'),
      weightKg: 28,
      color: 'Чёрно-рыжий',
      bio: 'Молодая овчарка, ищем пару с документами.',
      temperament: ['активная', 'умная'],
      latitude: 41.325,
      longitude: 69.27,
      photo: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&w=1200',
      verifiedDocs: false,
    },
    {
      ownerId: javlon.id,
      name: 'Рекс',
      breedId: byName['Лабрадор'].id,
      sex: Sex.MALE,
      birthDate: new Date('2022-11-02'),
      weightKg: 32,
      color: 'Палевый',
      bio: 'Лабрадор для вязки, характер мягкий.',
      temperament: ['добрый', 'игривый'],
      latitude: 41.285,
      longitude: 69.203,
      photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&w=1200',
      verifiedDocs: true,
    },
    {
      ownerId: dilnoza.id,
      name: 'Снежок',
      breedId: byName['Хаски'].id,
      sex: Sex.FEMALE,
      birthDate: new Date('2022-02-14'),
      weightKg: 22,
      color: 'Серо-белый',
      bio: 'Хаски с ДНК-тестом, ищем кобеля той же породы.',
      temperament: ['энергичная', 'голос'],
      latitude: 41.34,
      longitude: 69.29,
      photo: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&w=1200',
      verifiedDocs: true,
    },
  ];

  for (const item of pets) {
    const pet = await prisma.pet.create({
      data: {
        ownerId: item.ownerId,
        speciesId: dog.id,
        breedId: item.breedId,
        name: item.name,
        sex: item.sex,
        birthDate: item.birthDate,
        weightKg: item.weightKg,
        color: item.color,
        bio: item.bio,
        temperament: item.temperament,
        breedingStatus: BreedingStatus.LOOKING,
        city: 'Toshkent',
        latitude: item.latitude,
        longitude: item.longitude,
        isPublished: true,
        photos: { create: { url: item.photo, sortOrder: 0 } },
        searchPreference: {
          create: {
            sex: item.sex === Sex.MALE ? Sex.FEMALE : Sex.MALE,
            city: 'Toshkent',
            radiusKm: 40,
            ageMin: 1,
            ageMax: 8,
          },
        },
      },
    });

    if (item.verifiedDocs) {
      await prisma.petDocument.create({
        data: {
          petId: pet.id,
          type: DocumentType.VACCINATION,
          fileUrl: item.photo,
          issuer: 'Ветклиника Ташкент',
          issuedAt: new Date('2026-03-01'),
          expiresAt: new Date('2027-03-01'),
          status: VerificationStatus.VERIFIED,
          review: {
            create: {
              reviewerId: admin.id,
              status: VerificationStatus.VERIFIED,
              reviewedAt: new Date(),
            },
          },
        },
      });
      await prisma.petDocument.create({
        data: {
          petId: pet.id,
          type: DocumentType.PEDIGREE,
          fileUrl: item.photo,
          issuer: 'RKF / local registry',
          issuedAt: new Date('2024-01-01'),
          status: VerificationStatus.VERIFIED,
          review: {
            create: {
              reviewerId: admin.id,
              status: VerificationStatus.VERIFIED,
              reviewedAt: new Date(),
            },
          },
        },
      });
    }
  }

  console.log('Seed completed. Demo phones:');
  console.log('Admin  +998900000000  OTP 111111');
  console.log('Malika +998901111111  OTP 111111');
  console.log('Aziz   +998902222222  OTP 111111');
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
