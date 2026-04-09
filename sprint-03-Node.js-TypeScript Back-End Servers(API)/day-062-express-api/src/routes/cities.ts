/* ── In-memory data ──────────────────────────────────────────────────
   We don't have a database yet (that's Day 64).
   For now, data lives in an array in memory.
   Every time the server restarts, changes are lost — that's fine for now.
   The route handlers will read and write to this array directly.
────────────────────────────────────────────────────────────────────── */

import { City } from "../types";

export const cities: City[] = [
  { id: 1,  name: "Lagos",         state: "Lagos",          region: "South-West",   population: 15000000, isCapital: false, knownFor: "Commercial capital and financial hub of Nigeria" },
  { id: 2,  name: "Abuja",         state: "FCT",            region: "North-Central", population: 3600000,  isCapital: true,  knownFor: "Federal capital territory and seat of government" },
  { id: 3,  name: "Kano",          state: "Kano",           region: "North-West",   population: 4000000,  isCapital: true,  knownFor: "Largest city in northern Nigeria, ancient trade centre" },
  { id: 4,  name: "Ibadan",        state: "Oyo",            region: "South-West",   population: 3600000,  isCapital: true,  knownFor: "Largest city by land area in sub-Saharan Africa" },
  { id: 5,  name: "Port Harcourt", state: "Rivers",         region: "South-South",  population: 2500000,  isCapital: true,  knownFor: "Oil capital of Nigeria and Garden City" },
  { id: 6,  name: "Benin City",    state: "Edo",            region: "South-South",  population: 1800000,  isCapital: true,  knownFor: "Ancient Benin Kingdom and bronze artwork" },
  { id: 7,  name: "Maiduguri",     state: "Borno",          region: "North-East",   population: 1200000,  isCapital: true,  knownFor: "Gateway to Lake Chad and historical Kanuri capital" },
  { id: 8,  name: "Zaria",         state: "Kaduna",         region: "North-West",   population: 1200000,  isCapital: false, knownFor: "Home of Ahmadu Bello University, historic emirate" },
  { id: 9,  name: "Aba",           state: "Abia",           region: "South-East",   population: 1050000,  isCapital: false, knownFor: "Commercial city known for manufacturing and trade" },
  { id: 10, name: "Enugu",         state: "Enugu",          region: "South-East",   population: 900000,   isCapital: true,  knownFor: "Coal City and cultural centre of south-east Nigeria" },
  { id: 11, name: "Kaduna",        state: "Kaduna",         region: "North-West",   population: 1700000,  isCapital: true,  knownFor: "Industrial city and administrative hub of North-West" },
  { id: 12, name: "Onitsha",       state: "Anambra",        region: "South-East",   population: 1100000,  isCapital: false, knownFor: "Home of one of the largest markets in Africa" },
  { id: 13, name: "Abeokuta",      state: "Ogun",           region: "South-West",   population: 700000,   isCapital: true,  knownFor: "City built around Olumo Rock, cultural hub" },
  { id: 14, name: "Warri",         state: "Delta",          region: "South-South",  population: 900000,   isCapital: false, knownFor: "Oil-producing city in the Niger Delta region" },
  { id: 15, name: "Jos",           state: "Plateau",        region: "North-Central", population: 900000,  isCapital: true,  knownFor: "Tin City on the plateau, known for cool weather" },
];

/* Next ID counter for POST /cities (creating new cities) */
export let nextId = cities.length + 1;
export function incrementNextId() { nextId++; }