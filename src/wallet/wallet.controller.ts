import { Body, Controller, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit')
  deposit(@Body() dto: DepositDto) {
    return this.walletService.deposit(dto);
  }

  @Post('withdraw')
  withdraw(@Body() dto: WithdrawDto) {
    return this.walletService.withdraw(dto);
  }
  
  @Post('transfer')
  transfer(@Body() dto: TransferDto){
    return this.walletService.transfer(dto)
  }

}
