import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { Address } from '@ecommerce/shared';

export class UserService {
  static async updateProfile(userId: string, data: { name?: string; phone?: string; avatarUrl?: string | null }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  static async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) throw new AppError('Incorrect current password', 400);

    const newHash = await bcrypt.hash(newPass, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { message: 'Password updated successfully' };
  }

  static async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async addAddress(userId: string, data: Omit<Address, 'id' | 'userId'>) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // If first address, mark as default
    const count = await prisma.address.count({ where: { userId } });
    const isDefault = count === 0 ? true : Boolean(data.isDefault);

    return prisma.address.create({
      data: {
        ...data,
        isDefault,
        userId,
      },
    });
  }

  static async updateAddress(userId: string, addressId: string, data: Partial<Omit<Address, 'id' | 'userId'>>) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new AppError('Address not found', 404);

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  static async deleteAddress(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new AppError('Address not found', 404);

    await prisma.address.delete({ where: { id: addressId } });
    return { message: 'Address deleted successfully' };
  }
}
