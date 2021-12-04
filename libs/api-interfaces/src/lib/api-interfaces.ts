import { ApiProperty } from '@nestjs/swagger'

export enum ToolStatus {
  ONLINE,
  OFFLINE,
  MAINTENANCE,
}

export enum AccountCreation {
  SELF,
  ON_REQUEST,
  LOCKED,
  NO_ACCOUNT,
}

export class ToolDto {
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

export class StorageDto {
  @ApiProperty({ description: 'Size string in human-readable format.' })
  remaining: string

  @ApiProperty({ minimum: 0, maximum: 100 })
  percent: number
}

export class BackupDto {
  @ApiProperty()
  date: number

  @ApiProperty()
  duration: number

  @ApiProperty()
  compression: number

  @ApiProperty()
  downtime: number

  @ApiProperty({ description: 'Size string in human-readable format.' })
  rawSize: string

  @ApiProperty({ description: 'Size string in human-readable format.' })
  compressedSize: string

  @ApiProperty()
  toolName: string

  @ApiProperty({ description: 'Path to image for tool, is relative to assets/icons folder in frontend.' })
  img: string
}

export class Backup {
  constructor(
    public date: Date,
    public duration: number,
    public toolName: string,
    public compression: number,
    public downtime: number,
    public rawSize: string,
    public compressedSize: string,
    public img: string
  ) {}
}
