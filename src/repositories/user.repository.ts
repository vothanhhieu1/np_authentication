import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasOneRepositoryFactory,
  juggler,
  repository,
  HasManyThroughRepositoryFactory,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {UserServiceBindings} from '../keys';
import {User, UserCredentials, UserRelations, Role, RoleMapping, Policy} from '../models';
import {UserCredentialsRepository} from './user-credentials.repository';
import {RoleRepository} from './role.repository';
import {PolicyRepository} from './policy.repository';
import {RoleMappingRepository} from './role-mapping.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly userCredentials: HasOneRepositoryFactory<
    UserCredentials,
    typeof User.prototype.id
  >;

  public readonly roles: HasManyThroughRepositoryFactory<
    Role,
    typeof Role.prototype.id,
    RoleMapping,
    typeof RoleMapping.prototype.id
  >;
  
  public readonly policies: HasManyRepositoryFactory<
    Policy,
    typeof Policy.prototype.id
  >;

  constructor(
    @inject(`datasources.${UserServiceBindings.DATASOURCE_NAME}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserCredentialsRepository') protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>,
    @repository.getter('RoleRepository') protected roleRepositoryGetter: Getter<RoleRepository>,
    @repository.getter('RoleMappingRepository') protected roleMappingRepositoryGetter: Getter<RoleMappingRepository>,
    @repository.getter('PolicyRepository') protected policyRepositoryGetter: Getter<PolicyRepository>,
  ) {
    super(User, dataSource);
    this.userCredentials = this.createHasOneRepositoryFactoryFor(
      'userCredentials',
      userCredentialsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'userCredentials',
      this.userCredentials.inclusionResolver,
    );
    this.roles = this.createHasManyThroughRepositoryFactoryFor(
      'roles',
      roleRepositoryGetter,
      roleMappingRepositoryGetter
    )
    this.registerInclusionResolver('roles', this.roles.inclusionResolver)

    this.policies = this.createHasManyRepositoryFactoryFor(
      'policies',
      policyRepositoryGetter,
    )
    this.registerInclusionResolver('policies', this.policies.inclusionResolver)
  }

  async findCredentials(
    userId: typeof User.prototype.id,
  ): Promise<UserCredentials | undefined> {
    return this.userCredentials(userId)
      .get()
      .catch(err => {
        if (err.code === 'ENTITY_NOT_FOUND') return undefined;
        throw err;
      });
  }

}
