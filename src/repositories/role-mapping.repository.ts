import {inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  juggler,
  BelongsToAccessor,
  Getter,
  repository,
} from '@loopback/repository';
import {RoleMapping, RoleMappingRelations, Role, User} from '../models';
import {UserServiceBindings} from '../keys';
import { RoleRepository } from './role.repository'
import { UserRepository } from './user.repository'

export class RoleMappingRepository extends DefaultCrudRepository<
  RoleMapping,
  typeof RoleMapping.prototype.id,
  RoleMappingRelations
> {

  public readonly role: BelongsToAccessor<
    Role,
    typeof Role.prototype.id
  >;

  public readonly user: BelongsToAccessor<
    User,
    typeof User.prototype.id
  >;

  constructor(
    @inject(`datasources.${UserServiceBindings.DATASOURCE_NAME}`) dataSource: juggler.DataSource,
    @repository.getter('RoleRepository') roleRepositoryGetter: Getter<RoleRepository>,
    @repository.getter('UserRepository') userRepositoryGetter: Getter<UserRepository>
  ) {
    super(RoleMapping, dataSource);

    this.role = this.createBelongsToAccessorFor('role', roleRepositoryGetter)
    this.registerInclusionResolver('role', this.role.inclusionResolver)

    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter)
    this.registerInclusionResolver('user', this.user.inclusionResolver)
  }
}
