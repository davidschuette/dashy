import { ApiProperty } from '@nestjs/swagger'

export class BackupDto {
  @ApiProperty()
  date: string

  @ApiProperty()
  duration: number

  @ApiProperty()
  downtime: number

  @ApiProperty({ description: 'Size string in human-readable format.' })
  rawSize: string

  @ApiProperty()
  toolName: string

  @ApiProperty({ description: 'Path to image for tool, is relative to assets/icons folder in frontend.' })
  img: string
}
