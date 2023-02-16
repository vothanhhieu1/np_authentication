import { inject } from '@loopback/core'
import { repository } from '@loopback/repository';
import {Role, Policy} from '../models';
import {
  UserRepository,
  RoleRepository,
  PolicyRepository,
} from '../repositories';
import { UserServiceBindings, } from '../keys'
import { PolicyService } from '../services'

export class RoleService {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(RoleRepository) public roleRepository: RoleRepository,
    @repository(PolicyRepository) public policyRepository: PolicyRepository,
    @inject(UserServiceBindings.POLICY_SERVICE) public policyService: PolicyService,
  ) {}

  async findOrCreate(role: Role) {
    const { name, organizer } = role
    let found = await this.roleRepository.findOne({ where: { name, organizer }})
    if (!found) {
      found = await this.roleRepository.create(new Role({ name, organizer }))
    }
    return found
  }

  async createRoleWithPolicies(role: Role): Promise<Role> {
    let { policies } = role
    const found = await this.findOrCreate(role)
    if (found && policies) {
      policies = policies.map(policy => new Policy({ ...policy, roleId: found?.id }))
      await this.policyRepository.createAll(policies)
    }

    return found
  }

  async createRolesWithPolicies(roles: Role[]): Promise<Role[]> {
    let allPolicies: Policy[] = []
    const founds: Role[] = []
    for (const role of roles) {
      let { policies } = role
      const found = await this.findOrCreate(role)
      if (found && policies) {
        founds.push(found)
        policies = policies.map(policy => new Policy({ ...policy, roleId: found?.id }))
        allPolicies = [...allPolicies, ...policies]
      }
    }

    await this.policyRepository.createAll(allPolicies)
    return founds
  }

  async save(id: number, role: Role) {
    const { name, policies = [], organizer } = role
    let found: Role
    if (!id) {
      found = await this.createRoleWithPolicies(role)
    } else {
      found = await this.roleRepository.findById(id, { include: [{ relation: 'policies' }] })
      const { policies: currentPolicies = [] } = role
      await this.roleRepository.updateById(id, { name })
      await this.policyService.updatePolicies(id, 'roleId', name, organizer, policies, currentPolicies)
    }
    return found
  }
}
