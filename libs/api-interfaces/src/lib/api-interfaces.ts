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
  name: string
  description: string
  status: ToolStatus
  url: string
  img: string
  accountCreation: AccountCreation
  lastBackup: number
}

export class StorageDto {
  remaining: string
  percent: number
}

export class BackupDto {
  date: number
  duration: number
  compression: number
  downtime: number
  rawSize: string
  compressedSize: string
  toolName: string
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