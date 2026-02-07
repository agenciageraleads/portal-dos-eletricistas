import { IsIn, IsOptional, IsString } from 'class-validator';

export class BudgetDecisionDto {
  @IsIn(['ACCEPT', 'REJECT', 'NEGOTIATE'])
  decision: 'ACCEPT' | 'REJECT' | 'NEGOTIATE';

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  cpf?: string;

  @IsString()
  @IsOptional()
  signatureDataUrl?: string;

  @IsString()
  @IsOptional()
  rejectReasons?: string;

  @IsString()
  @IsOptional()
  rejectNote?: string;
}
