import { ApiProperty } from '@nestjs/swagger'

export class StorageDto {
  @ApiProperty({ description: 'Size string in human-readable format.' })
  remaining: string

  @ApiProperty({ minimum: 0, maximum: 100 })
  percent: number
}
