import { Adapter, Helper, Model } from "casbin"
import _ from 'lodash'

export class PostgresAdapter implements Adapter {

  constructor(private permissions: string[]) {}

  async loadPolicy(model: Model): Promise<void> {
    if (!_.isEmpty(this.permissions)) {
      for (const permission of this.permissions) {
        const parts = permission.split('/')
        const rule = `p,*,${parts[0]},${parts[1]}`
        Helper.loadPolicyLine(rule, model)
      }
    } else {
      console.log('Role does not have permissions')
    }
  }

  async savePolicy(model: Model): Promise<boolean> {
  // TODO
    return true
  }

  async addPolicy(sec: string, ptype: string, rule: string[]): Promise<void> {
    // TODO
  }

  async removePolicy(sec: string, ptype: string, rule: string[]): Promise<void> {
    // TODO
  }

  async removeFilteredPolicy(sec: string, ptype: string, fieldIndex: number, ...fieldValues: string[]): Promise<void> {
    // TODO
  }

}
