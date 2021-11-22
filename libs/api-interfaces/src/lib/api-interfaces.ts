export enum ToolStatus {
  ONLINE,
  OFFLINE,
  MAINTENANCE,
}

export class ToolDto {
  name?: string
  description?: string
  status?: ToolStatus
  url?: string
  img?: string
}
