import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { WalletType } from 'prisma/generated/prisma/enums';
import { TransferDto } from './dto/transfer.dto';

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

  async transfer(dto: TransferDto) {
    return this.prisma.$transaction(async (tx) => {
     const result = await tx.user.updateMany({
      where: {
        id: dto.fromUserId,
        balance: {
          gte: dto.amount,
        },
      },
      data: {
        balance: {
          decrement: dto.amount
        }
      }
     })
     if (result.count == 0) {
       throw new ConflictException(
       "Insufficient balance"
      );
     }

      await tx.user.update({
        where: {
          id: dto.toUserId,
        },

        data: {
          balance: {
            increment: dto.amount,
          },
        },
      });

      await tx.wallet.createMany({
        data: [
          {
            userId: dto.fromUserId,
            type: WalletType.WITHDRAW,
            amount: dto.amount,
            invoiceNumber: dto.invoiceNumber + '-OUT',
          },
          {
            userId: dto.toUserId,
            type: WalletType.DEPOSIT,
            amount: dto.amount,
            invoiceNumber: dto.invoiceNumber + '-IN',
          },
        ],
      });

      return {
        success: true,
      };
    }, { timeout: 10000 });
  }
}
