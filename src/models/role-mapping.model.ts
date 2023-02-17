import {Entity, property, model, belongsTo} from '@loopback/repository';
import { User } from './user.model'
import { Role } from './role.model'

@model()
export class RoleMapping extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @belongsTo(() => User)
  userId: number

  @belongsTo(() => Role)
  roleId: number

  [prop: string]: any;

  constructor(data?: Partial<RoleMapping>) {
    super(data);
  }
}

export interface RoleMappingRelations {
  // TODO
}

export type RoleMappingWithRelations = RoleMapping & RoleMappingRelations

