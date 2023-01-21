import { ApiProperty } from '@nestjs/swagger'
import { AccountCreation, ToolStatus } from './api-interfaces'

export class ToolDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  description: string

  @ApiProperty({ enum: ToolStatus })
  status: ToolStatus

  @ApiProperty()
  url: string

  @ApiProperty({ description: 'Path to image for tool, is relative to assets/icons folder in frontend.' })
  img: string

  @ApiProperty({ enum: AccountCreation })
  accountCreation: AccountCreation

  @ApiProperty()
  lastBackup: number
}
