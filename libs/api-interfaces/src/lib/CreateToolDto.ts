import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsString, IsUrl } from 'class-validator'
import { AccountCreation, AccountCreationArray } from './api-interfaces'

export class CreateToolDto {
  @IsString()
  @ApiProperty()
  name: string

  @IsString()
  @ApiProperty()
  description: string

  @IsUrl()
  @ApiProperty()
  url: string

  @IsString()
  @ApiProperty()
  img: string

  @IsIn(AccountCreationArray)
  @ApiProperty({ enum: AccountCreationArray })
  accountCreation: AccountCreation
}
