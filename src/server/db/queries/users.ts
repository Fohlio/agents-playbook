import { prisma } from '../client';
import { withRetry } from '../retry';
import { hashPassword } from '../../auth/password';
import { User, UserTier, UserRole } from '@prisma/client';

/**
 * User creation data
 */
export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  tier?: UserTier;
  role?: UserRole;
}

/**
 * Create a new user with hashed password
 * @param data - User creation data
 * @returns Promise<User> - Created user (without password hash)
 */
export async function createUser(data: CreateUserData): Promise<Omit<User, 'passwordHash'>> {
  return withRetry(async () => {
    // Hash password before storing
    const passwordHash = await hashPassword(data.password);
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        tier: data.tier || UserTier.FREE,
        role: data.role || UserRole.USER,
      },
      select: {
        id: true,
        email: true,
        username: true,
        tier: true,
        role: true,
        openaiApiKey: true,
        openaiApiKeyUpdatedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return user;
  });
}

/**
 * Get user by ID
 * @param id - User UUID
 * @param includePasswordHash - Include password hash (default: false)
 * @returns Promise<User | null>
 */
export async function getUserById(
  id: string,
  includePasswordHash: boolean = false
): Promise<User | null> {
  return withRetry(async () => {
    if (includePasswordHash) {
      return prisma.user.findUnique({
        where: { id },
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        tier: true,
        role: true,
        openaiApiKey: true,
        openaiApiKeyUpdatedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as User | null;
  });
}

/**
 * Get user by email (for authentication)
 * @param email - User email
 * @returns Promise<User | null> - Includes password hash for verification
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return withRetry(async () => {
    return prisma.user.findUnique({
      where: { email },
    });
  });
}

/**
 * Get user by username
 * @param username - Username
 * @returns Promise<User | null>
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  return withRetry(async () => {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        username: true,
        tier: true,
        role: true,
        openaiApiKey: true,
        openaiApiKeyUpdatedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as User | null;
  });
}

/**
 * Update user data
 * @param id - User UUID
 * @param data - Partial user data to update
 * @returns Promise<User> - Updated user
 */
export async function updateUser(
  id: string,
  data: Partial<Omit<User, 'id' | 'passwordHash' | 'createdAt' | 'updatedAt'>>
): Promise<Omit<User, 'passwordHash'>> {
  return withRetry(async () => {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        tier: true,
        role: true,
        openaiApiKey: true,
        openaiApiKeyUpdatedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  });
}

/**
 * Update user password
 * @param id - User UUID
 * @param newPassword - New plain text password
 * @returns Promise<void>
 */
export async function updateUserPassword(id: string, newPassword: string): Promise<void> {
  return withRetry(async () => {
    const passwordHash = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  });
}

/**
 * Delete user (cascade deletes related data)
 * @param id - User UUID
 * @returns Promise<void>
 */
export async function deleteUser(id: string): Promise<void> {
  return withRetry(async () => {
    await prisma.user.delete({
      where: { id },
    });
  });
}

