import { authenticate, } from '@loopback/authentication';
import {get, post} from '@loopback/rest';
import { authorize } from '@loopback/authorization'

export class EmployeeController {
  constructor() {}

  @authenticate('jwt')
  @authorize({ scopes: ['write'], resource: 'employees' })
  @post('/employees', {
    responses: {
      '200': {
        description: '',
        schema: {
          type: 'string',
        },
      },
    },
  })
  async create(): Promise<string> {
    return 'create employee'
  }

  @authenticate('jwt')
  @authorize({ scopes: ['read'], resource: 'employees' })
  @get('/employees', {
    responses: {
      '200': {
        description: '',
        schema: {
          type: 'string',
        },
      },
    },
  })
  async find(): Promise<string> {
    return 'find employees'
  }
}
