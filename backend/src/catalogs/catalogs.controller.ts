import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class CatalogsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('species')
  species() {
    return this.prisma.species.findMany({
      where: { active: true },
      include: { breeds: { where: { active: true }, orderBy: { nameRu: 'asc' } } },
    });
  }

  @Get('breeds')
  breeds() {
    return this.prisma.breed.findMany({
      where: { active: true },
      orderBy: { nameRu: 'asc' },
    });
  }
}
