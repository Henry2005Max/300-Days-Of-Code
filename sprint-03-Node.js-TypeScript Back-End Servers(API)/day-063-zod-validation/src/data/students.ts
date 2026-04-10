import { Student } from "../types";

export const students: Student[] = [
  { id: 1,  name: "Chidi Okeke",    email: "chidi@example.com",   age: 22, track: "Web",    level: "Intermediate", city: "Lagos",        gdgMember: true,  enrolledAt: "2025-01-10" },
  { id: 2,  name: "Amaka Nwosu",    email: "amaka@example.com",   age: 24, track: "Mobile", level: "Beginner",     city: "Enugu",        gdgMember: true,  enrolledAt: "2025-01-12" },
  { id: 3,  name: "Tunde Adeleke",  email: "tunde@example.com",   age: 26, track: "Data",   level: "Advanced",     city: "Ibadan",       gdgMember: false, enrolledAt: "2025-01-15" },
  { id: 4,  name: "Fatima Bello",   email: "fatima@example.com",  age: 21, track: "UI/UX",  level: "Beginner",     city: "Abuja",        gdgMember: true,  enrolledAt: "2025-01-18" },
  { id: 5,  name: "Emeka Okafor",   email: "emeka@example.com",   age: 23, track: "Web",    level: "Advanced",     city: "Port Harcourt",gdgMember: false, enrolledAt: "2025-01-20" },
  { id: 6,  name: "Ngozi Eze",      email: "ngozi@example.com",   age: 25, track: "DevOps", level: "Intermediate", city: "Aba",          gdgMember: true,  enrolledAt: "2025-01-22" },
  { id: 7,  name: "Uche Obi",       email: "uche@example.com",    age: 28, track: "Mobile", level: "Advanced",     city: "Lagos",        gdgMember: true,  enrolledAt: "2025-01-25" },
  { id: 8,  name: "Halima Musa",    email: "halima@example.com",  age: 20, track: "Web",    level: "Beginner",     city: "Kano",         gdgMember: false, enrolledAt: "2025-01-28" },
  { id: 9,  name: "Seun Adeyemi",   email: "seun@example.com",    age: 27, track: "Data",   level: "Intermediate", city: "Abeokuta",     gdgMember: true,  enrolledAt: "2025-02-01" },
  { id: 10, name: "Kemi Ogundimu",  email: "kemi@example.com",    age: 22, track: "UI/UX",  level: "Advanced",     city: "Lagos",        gdgMember: false, enrolledAt: "2025-02-05" },
];

export let nextId = students.length + 1;
export function incrementNextId() { nextId++; }