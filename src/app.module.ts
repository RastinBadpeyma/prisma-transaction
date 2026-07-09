import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { PrismaModule } from './prisma/prisma.module';


@Module({
  imports: [UsersModule, WalletModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
