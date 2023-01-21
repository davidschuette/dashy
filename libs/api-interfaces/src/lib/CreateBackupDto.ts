import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsPositive, IsString } from 'class-validator'

export class CreateBackupDto {
  @IsInt()
  @IsPositive()
  @ApiProperty()
  duration: number

  @IsInt()
  @IsPositive()
  @ApiProperty()
  downtime: number

  @IsString()
  @ApiProperty({ description: 'Size string in human-readable format.' })
  rawSize: string
}
