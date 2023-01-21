import { ExecutionContext } from '@nestjs/common'
import { environment } from '../../environments/environment'
import { AuthGuard } from './auth.guard'

describe('AuthGuard', () => {
  it('should be defined', () => {
    expect(new AuthGuard()).toBeDefined()
  })

  it('Check valid apiKey', () => {
    const key = 'test'
    // @ts-expect-error
    environment.apiKey = key

    const guard = new AuthGuard()

    const context1: ExecutionContext = {
      // @ts-expect-error
      switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: key } }) }),
    }
    const context2: ExecutionContext = {
      // @ts-expect-error
      switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: 'bearer ' + key } }) }),
    }
    const context3: ExecutionContext = {
      // @ts-expect-error
      switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: 'Bearer ' + key } }) }),
    }

    expect(guard.canActivate(context1)).toEqual(true)
    expect(guard.canActivate(context2)).toEqual(true)
    expect(guard.canActivate(context3)).toEqual(true)
  })

  it('Check apiKey mismatch', () => {
    // @ts-expect-error
    environment.apiKey = 'false'
    const key = 'test'

    const guard = new AuthGuard()
    const context1: ExecutionContext = {
      // @ts-expect-error
      switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: key } }) }),
    }
    const context2: ExecutionContext = {
      // @ts-expect-error
      switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: 'bearer ' + key } }) }),
    }
    const context3: ExecutionContext = {
      // @ts-expect-error
      switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: 'Bearer ' + key } }) }),
    }

    expect(guard.canActivate(context1)).toEqual(false)
    expect(guard.canActivate(context2)).toEqual(false)
    expect(guard.canActivate(context3)).toEqual(false)
  })

  it('Check empty authorization header', () => {
    // @ts-expect-error
    environment.apiKey = 'test'
    const key = ''

    const guard = new AuthGuard()
    const context1: ExecutionContext = {
      // @ts-expect-error
      switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: key } }) }),
    }
    const context2: ExecutionContext = {
      // @ts-expect-error
      switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: 'bearer ' + key } }) }),
    }
    const context3: ExecutionContext = {
      // @ts-expect-error
      switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: 'Bearer ' + key } }) }),
    }

    expect(guard.canActivate(context1)).toEqual(false)
    expect(guard.canActivate(context2)).toEqual(false)
    expect(guard.canActivate(context3)).toEqual(false)
  })
})
