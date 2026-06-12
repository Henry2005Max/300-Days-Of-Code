import { getDb } from '../db/connection';
import { User } from '../types';

export function createUser(name: string, email: string): User {
  const db = getDb();
  const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
  const info = stmt.run(name, email);
  return getUserById(info.lastInsertRowid as number)!;
}

export function getUserById(id: number): User | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function getUserByEmail(email: string): User | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}

export function listUsers(): User[] {
  const db = getDb();
  return db.prepare('SELECT * FROM users ORDER BY id').all() as User[];
}
