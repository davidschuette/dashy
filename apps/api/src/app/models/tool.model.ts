import { AccountCreation } from '@dashy/api-interfaces'

export class Tool {
  id: string
  name: string
  description: string
  url: string
  img: string
  containerNames: string
  accountCreation: AccountCreation
  isInMaintenance: boolean
}
