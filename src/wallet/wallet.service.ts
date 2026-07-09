import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { WalletType } from 'prisma/generated/prisma/enums';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async deposit(dto: DepositDto) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.create({
        data: {
          type: WalletType.DEPOSIT,
          amount: dto.amount,
          reason: dto.reason,
          invoiceNumber: dto.invoiceNumber,
          userId: dto.userId,
        },
      });

      throw new Error('Boom 💥');

      await tx.user.update({
        where: {
          id: dto.userId,
        },
        data: {
          balance: {
            increment: dto.amount,
          },
        },
      });

      return wallet;
    });
  }

  async withdraw(dto: WithdrawDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
    });

    if (!user) throw new BadRequestException('User not found');

    if (Number(user.balance) < dto.amount)
      throw new BadRequestException('Insufficient balance');

    await this.prisma.user.update({
      where: {
        id: dto.userId,
      },

      data: {
        balance: {
          decrement: dto.amount,
        },
      },
    });

    return this.prisma.wallet.create({
      data: {
        type: WalletType.WITHDRAW,
        amount: dto.amount,
        reason: dto.reason,
        invoiceNumber: dto.invoiceNumber,
        userId: dto.userId,
      },
    });
  }
}
