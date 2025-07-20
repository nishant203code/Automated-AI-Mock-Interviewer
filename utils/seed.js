// Script to create tables (if missing) and seed the Neon database with fake/mock data
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { faker } from '@faker-js/faker';
import {
  MockInterview,
  Question,
  UserAnswer,
  Newsletter
} from './schema.js';

const sql = neon(process.env.NEXT_PUBLIC_DRIZZLE_DB_URL);
const db = drizzle(sql);

async function seed() {
  // Clear existing data
  await db.delete(MockInterview);
  await db.delete(Question);
  await db.delete(UserAnswer);
  await db.delete(Newsletter);

  // Use a known test user email for Clerk
  const testUserEmail = "omprakashtiwari1515@gmail.com";

  // Insert mock interviews (1 for test user, rest random)
  await db.insert(MockInterview).values({
    jsonMockResp: JSON.stringify({ intro: faker.lorem.sentence() }),
    jobPosition: "Frontend Developer",
    jobDesc: "React, Next.js, Tailwind, TypeScript",
    jobExperience: "3",
    createdBy: testUserEmail,
    createdAt: new Date().toISOString(),
    mockId: "test-mock-id-1",
  });
  for (let i = 0; i < 19; i++) {
    await db.insert(MockInterview).values({
      jsonMockResp: JSON.stringify({ intro: faker.lorem.sentence() }),
      jobPosition: faker.name.jobTitle(),
      jobDesc: faker.lorem.paragraph(),
      jobExperience: faker.lorem.word(),
      createdBy: faker.internet.email(),
      createdAt: new Date().toISOString(),
      mockId: faker.string.uuid(),
    });
  }

  // Insert questions (1 for test user, rest random)
  await db.insert(Question).values({
    MockQuestionJsonResp: JSON.stringify({ q: "What is React?" }),
    jobPosition: "Frontend Developer",
    jobDesc: "React, Next.js, Tailwind, TypeScript",
    jobExperience: "3",
    typeQuestion: "technical",
    company: "Test Company",
    createdBy: testUserEmail,
    createdAt: new Date().toISOString(),
    mockId: "test-mock-id-1",
  });
  for (let i = 0; i < 39; i++) {
    await db.insert(Question).values({
      MockQuestionJsonResp: JSON.stringify({ q: faker.lorem.sentence() }),
      jobPosition: faker.name.jobTitle(),
      jobDesc: faker.lorem.sentence(),
      jobExperience: faker.lorem.word(),
      typeQuestion: faker.lorem.word(),
      company: faker.company.name(),
      createdBy: faker.internet.email(),
      createdAt: new Date().toISOString(),
      mockId: faker.string.uuid(),
    });
  }

  // Insert user answers
  for (let i = 0; i < 40; i++) {
    await db.insert(UserAnswer).values({
      mockIdRef: faker.string.uuid(),
      question: faker.lorem.sentence(),
      correctAns: faker.lorem.sentence(),
      userAns: faker.lorem.sentence(),
      feedback: faker.lorem.sentence(),
      rating: String(faker.number.int({ min: 1, max: 5 })),
      userEmail: faker.internet.email(),
      createdAt: new Date().toISOString(),
    });
  }

  // Insert newsletter entries
  for (let i = 0; i < 10; i++) {
    await db.insert(Newsletter).values({
      newName: faker.person.fullName(),
      newEmail: faker.internet.email(),
      newMessage: faker.lorem.sentences(2),
      createdAt: new Date().toISOString(),
    });
  }

  console.log('Database seeded with more mock data!');
}

seed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
