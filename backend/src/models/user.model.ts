import { db } from "../database/prisma.js";

type UserRow = NonNullable<Awaited<ReturnType<typeof db.orm.public.User.first>>>;

export type UserRole = "seller" | "buyer" | "admin";
export type PublicUser = Omit<UserRow, "password">;

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "admin"> | UserRole;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

function withoutPassword(user: UserRow): PublicUser {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export class UserModel {
  static async findById(id: string): Promise<UserRow | null> {
    return db.orm.public.User.where({ id }).first();
  }

  static async findByEmail(email: string): Promise<UserRow | null> {
    return db.orm.public.User.where({ email }).first();
  }

  static async findByUsername(username: string): Promise<UserRow | null> {
    return db.orm.public.User.where({ username }).first();
  }

  static async list(): Promise<PublicUser[]> {
    const users = await db.orm.public.User.all();
    return users.map(withoutPassword);
  }

  static async create(data: CreateUserData): Promise<UserRow> {
    return db.orm.public.User.create(data);
  }

  static async update(
    id: string,
    data: UpdateUserData,
  ): Promise<UserRow | null> {
    return db.orm.public.User.where({ id }).update(data);
  }

  static async delete(id: string): Promise<UserRow | null> {
    return db.orm.public.User.where({ id }).delete();
  }
}

export function toPublicUser(user: UserRow): PublicUser {
  return withoutPassword(user);
}
