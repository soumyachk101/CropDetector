import { PrismaClient, CauseType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  const diseasesPath = path.join(__dirname, 'data', 'diseases.json');
  const diseasesData = JSON.parse(fs.readFileSync(diseasesPath, 'utf-8'));

  for (const item of diseasesData) {
    const disease = await prisma.diseaseKB.upsert({
      where: { id: item.id },
      update: {
        cropName: item.cropName,
        diseaseName: item.diseaseName,
        localNames: item.localNames,
        causeType: item.causeType as CauseType,
        causativeAgent: item.causativeAgent,
        overview: item.overview,
        symptoms: item.symptoms,
        organicTreatments: item.organicTreatments,
        chemicalTreatments: item.chemicalTreatments,
        preventiveMeasures: item.preventiveMeasures,
        progressionInfo: item.progressionInfo,
        isActive: true,
      },
      create: {
        id: item.id,
        cropName: item.cropName,
        diseaseName: item.diseaseName,
        localNames: item.localNames,
        causeType: item.causeType as CauseType,
        causativeAgent: item.causativeAgent,
        overview: item.overview,
        symptoms: item.symptoms,
        organicTreatments: item.organicTreatments,
        chemicalTreatments: item.chemicalTreatments,
        preventiveMeasures: item.preventiveMeasures,
        progressionInfo: item.progressionInfo,
        isActive: true,
      },
    });
    console.log(`Upserted disease: ${disease.diseaseName} (${disease.id})`);
  }

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
