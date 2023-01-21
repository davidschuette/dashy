import { Module } from '@nestjs/common'
import { NativeService } from './services/native.service'

@Module({ providers: [NativeService], exports: [NativeService] })
export class NativeModule {}
