import { Entity, property, model, hasMany } from '@loopback/repository';
import { Policy } from './policy.model'

@model({
  settings: {
    indexes: {
      'role_name_organizer_unique': {
        keys: {
          name: 1,
          organizer: 1
        },
        options: {
          unique: true
        }
      }
    },
  }
})
export class Role extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  organizer?: string;

  [prop: string]: any;

  @hasMany(() => Policy)
  policies?: Policy[]

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

export interface RoleRelations {
  // TODO
}

export type RoleWithRelations = Role & RoleRelations

