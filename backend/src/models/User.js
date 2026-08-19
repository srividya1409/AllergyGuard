// Placeholder in-memory store. Replace with real PostgreSQL queries
// (see /database/schema.sql) once the DB connection is wired up.

let users = [];
let nextId = 1;

async function findUserByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

async function createUser({ email, passwordHash, name }) {
  const user = {
    id: nextId++,
    email,
    passwordHash,
    name,
    allergyCategories: [],
    severity: {},
    emergencyMedication: null,
    emergencyContact: null,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

async function findUserById(id) {
  return users.find((u) => u.id === id) || null;
}

async function updateUser(id, updates) {
  const user = await findUserById(id);
  if (!user) return null;
  Object.assign(user, updates);
  return user;
}

module.exports = { findUserByEmail, createUser, findUserById, updateUser };
