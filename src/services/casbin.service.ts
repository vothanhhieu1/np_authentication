import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  Authorizer,
} from '@loopback/authorization';
import {inject, Provider} from '@loopback/core';
import {RESOURCE_ID} from '../keys';
import { CasbinEnforcer } from './casbin.enforcers'
import _ from 'lodash'

const DEFAULT_SCOPE = 'execute';

export class CasbinAuthorizationProvider implements Provider<Authorizer> {

  constructor(
    @inject('casbin.enforcer.factory') private casbinEnforcer: CasbinEnforcer
  ) {}

  /**
   * @returns authenticateFn
   */
  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ): Promise<AuthorizationDecision> {

    const resourceId = await authorizationCtx.invocationContext.get(
      RESOURCE_ID,
      {optional: true},
    );
    const object = resourceId ?? metadata.resource ?? authorizationCtx.resource;
    const action = metadata.scopes?.join(' ') ?? DEFAULT_SCOPE
    let rules = []
    let userId = ''
    let organizerId = ''

    if (authorizationCtx.principals.length > 0) {
      const user = _.pick(authorizationCtx.principals[0], [
        'id',
        'name',
        'rules',
        'organizerId'
      ])
      rules = user.rules
      userId = user.id
      organizerId = user.organizerId
    } else {
      return AuthorizationDecision.DENY
    }

    if (_.isEmpty(rules)) {
      return AuthorizationDecision.DENY
    }

    const enforcer = await this.casbinEnforcer.createEnforcer(rules)
    const allow = await enforcer.enforce(organizerId, userId, object, action)

    if (allow) return AuthorizationDecision.ALLOW;
    else if (allow === false) return AuthorizationDecision.DENY;
    return AuthorizationDecision.ABSTAIN;
  }
}

