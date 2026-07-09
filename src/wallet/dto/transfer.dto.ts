export class TransferDto {
  fromUserId!:number;
  toUserId!:number;
  amount!:number;
  reason?:string;
  invoiceNumber!:string;
}