import { Enforcer, newEnforcer } from 'casbin';
import path from 'path';

const POLICIES_REGEX = /^p,\\*/
const GROUP_REGEX = /^g,\\*/

const conf = path.resolve( __dirname, '../../src/__tests__/resource/rbac_model.conf');

export class CasbinEnforcer {

  constructor() {}

  async createEnforcer(rules: string[]): Promise<Enforcer> {
    const policyRegex = new RegExp(POLICIES_REGEX)
    const groupRegex = new RegExp(GROUP_REGEX)
    const policies = rules.filter(it => policyRegex.test(it))
    const groups = rules.filter(it => groupRegex.test(it))

    const casbinPolicies: string[][] = policies.map(item => {
      const parts = item.split(',')
      return parts.slice(1)
    })

    const casbinGroups = groups.map(item => {
      const parts = item.split(',')
      return parts.slice(1)
    })

    const enforcer = await newEnforcer(conf)
    await enforcer.addNamedPolicies('p', casbinPolicies)
    await enforcer.addNamedGroupingPolicies('g', casbinGroups)
    return enforcer
  }
}
