import { authenticate } from '@loopback/authentication';
import {get, post} from '@loopback/rest';
import { authorize } from '@loopback/authorization'

export class ProductController {
  constructor() {}

  @authenticate('jwt')
  @authorize({ scopes: ['write'], resource: 'products' })
  @post('/products', {
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
    return 'create product'
  }

  @authenticate('jwt')
  @authorize({ scopes: ['read'], resource: 'products' })
  @get('/products', {
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
    return 'find product'
  }
}
