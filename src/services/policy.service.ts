import { inject } from '@loopback/core'
import {repository} from '@loopback/repository';
import { Policy } from '../models';
import {
  UserRepository,
  UserCredentialsRepository,
  RoleRepository,
  PolicyRepository,
} from '../repositories';
import { JWTService } from './jwt.service'
import { TokenServiceBindings } from '../keys'
import _ from 'lodash'

export class PolicyService {

  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(UserCredentialsRepository) public userCredentialsRepository: UserCredentialsRepository,
    @repository(RoleRepository) public roleRepository: RoleRepository,
    @repository(PolicyRepository) public policyRepository: PolicyRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: JWTService,
  ) {}

  async addPolicies(
    principalId: number,
    principalField: string,
    v1: string,
    policies: Policy[],
    organizer: number | string = '*'
  ): Promise<boolean> {
    for (const policy of policies) {
      policies.push(new Policy({ ...policy, v0: `${organizer}`, v1, [principalField]: principalId }))
    }
    await this.policyRepository.createAll(policies)

    return true
  }

  async removePolicies(policyIds: typeof Policy.prototype.id[]): Promise<boolean> {
    for (const policyId of policyIds) {
      const policy = await this.policyRepository.findById(policyId)
      if (policy) {
        await this.policyRepository.deleteById(policyId)
      }
    }
    return true
  }

  async updateUserPolicies(policies: Policy[]) {
    for (const policy of policies) {
      const found = await this.policyRepository.findById(policy.id)
      const omit = _.omit(policy, 'id')
      if (found) {
        await this.policyRepository.updateById(found.id, { ...omit })
      }
    }
  }

  async updatePolicies(
    principalId: number,
    principalField: string,
    v1: string,
    organizer: number | string = '*',
    policies: Policy[],
    currentPolicies: Policy[],
  ) {

    const policyIds = policies ? policies.map(item => item.id) : []

    const currentPolicyIds = currentPolicies ? currentPolicies.map(item => item.id) : []

    const addIds = _.difference(policyIds, currentPolicyIds)  
    const updateIds = _.intersection(policyIds, currentPolicyIds)  
    const removeIds = _.difference(currentPolicyIds, policyIds)  

    if (addIds) {
      const adds = policies.filter(item => {
        return addIds.indexOf(item.id) >= 0
      })
      await this.addPolicies(principalId, principalField, v1, adds, organizer)
    }

    if (updateIds) {
      const updates = policies.filter(item => {
        return updateIds.indexOf(item.id) >= 0
      })
      await this.updateUserPolicies(updates)
    }

    if (removeIds) {
      await this.removePolicies(removeIds)
    }

    return true
  }

}
