import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  juggler,
  repository,
} from '@loopback/repository';
import {UserServiceBindings} from '../keys';
import {Role, RoleRelations, Policy} from '../models';
import { PolicyRepository } from './policy.repository'

export class RoleRepository extends DefaultCrudRepository<
  Role,
  typeof Role.prototype.id,
  RoleRelations
> {

  public readonly policies: HasManyRepositoryFactory<Policy, typeof Policy.prototype.id>

  constructor(
    @inject(`datasources.${UserServiceBindings.DATASOURCE_NAME}`)
    dataSource: juggler.DataSource,
    @repository.getter('PolicyRepository') policyRepositoryGetter: Getter<PolicyRepository>,
  ) {
    super(Role, dataSource);

    this.policies = this.createHasManyRepositoryFactoryFor('policies', policyRepositoryGetter)
    this.registerInclusionResolver('policies', this.policies.inclusionResolver)
  }

}
