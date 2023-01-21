export enum ToolStatus {
  ONLINE,
  OFFLINE,
  MAINTENANCE,
}

export enum AccountCreation {
  SELF = 'SELF',
  ON_REQUEST = 'ON_REQUEST',
  LOCKED = 'LOCKED',
  NO_ACCOUNT = 'NO_ACCOUNT',
}

export const AccountCreationArray = Object.values(AccountCreation)

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
