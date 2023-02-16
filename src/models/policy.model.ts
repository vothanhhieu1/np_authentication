import {Entity, property, model, belongsTo} from '@loopback/repository';
import { Role } from './role.model'
import { User } from './user.model'

@model()
export class Policy extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  pType?: string;

  @property({
    type: 'string',
  })
  v0: string;

  @property({
    type: 'string',
  })
  v1: string;

  @property({
    type: 'string',
  })
  v2: string;

  @property({
    type: 'string',
  })
  v3?: string

  @property({
    type: 'string',
  })
  v4?: string

  @property({
    type: 'string',
  })
  v5?: string

  @belongsTo(() => Role)
  roleId: number

  @belongsTo(() => User)
  userId: number

  [prop: string]: any;

  constructor(data?: Partial<Policy>) {
    super(data);
  }
}

export interface PolicyRelations {
  // TODO
}

export type PolicyWithRelations = Policy & PolicyRelations
