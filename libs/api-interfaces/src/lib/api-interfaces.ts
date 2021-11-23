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
  name?: string
  description?: string
  status?: ToolStatus
  url?: string
  img?: string
  accountCreation?: AccountCreation
}

export class StorageDto {
  remaining: string
  percent: number
}
