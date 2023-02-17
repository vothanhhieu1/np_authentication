import {Entity, hasOne, model, property, hasMany} from '@loopback/repository';
import {UserCredentials} from './user-credentials.model';
import {Role} from './role.model';
import {RoleMapping} from './role-mapping.model';
import {Policy} from './policy.model';

@model()
export class User extends Entity {
  // must keep it
  // add id:string<UUID>
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  realm?: string;

  // must keep it
  @property({
    type: 'string',
    required: true,
    index: {
      unique: true,
    },
  })
  username: string;

  // must keep it
  // feat email unique
  @property({
    type: 'string',
    index: {
      unique: true,
    },
  })
  email: string;

  @property({
    type: 'boolean',
  })
  emailVerified?: boolean;

  @property({
    type: 'string',
  })
  verificationToken?: string;

  @property({
    type: 'string',
  })
  organizer?: string;

  @hasOne(() => UserCredentials)
  userCredentials: UserCredentials;

  @hasMany(() => Role, { through: { model: () => RoleMapping } })
  roles: Role[]

  @hasMany(() => Policy)
  policies: Policy[]

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
  roleIds: number[]
}

export type UserWithRelations = User & UserRelations;

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}
