import {registerAuthenticationStrategy} from '@loopback/authentication';
import {
  Application,
  Binding,
  Component,
  CoreBindings,
  createBindingFromClass,
  inject,
} from '@loopback/core';
import {
  AuthorizationTags,
  TokenServiceBindings,
  TokenServiceConstants,
  UserServiceBindings,
} from './keys';
import {
  UserCredentialsRepository,
  UserRepository,
  PolicyRepository,
  RoleRepository,
  RoleMappingRepository,
} from './repositories';
import {UserService, RoleService, PolicyService} from './services';
import {JWTAuthenticationStrategy} from './services/jwt.auth.strategy';
import {JWTService} from './services/jwt.service';
import {SecuritySpecEnhancer} from './services/security.spec.enhancer';

export class AuthComponent implements Component {
  bindings = [
    // token bindings
    Binding.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    ),
    Binding.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    ),
    Binding.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService),

    // user bindings
    Binding.bind(UserServiceBindings.USER_SERVICE).toClass(UserService),
    Binding.bind(UserServiceBindings.ROLE_SERVICE).toClass(RoleService),
    Binding.bind(UserServiceBindings.POLICY_SERVICE).toClass(PolicyService),
    Binding.bind(UserServiceBindings.USER_REPOSITORY).toClass(UserRepository),
    Binding.bind(UserServiceBindings.ROLE_REPOSITORY).toClass(RoleRepository),
    Binding.bind(UserServiceBindings.POLICY_REPOSITORY).toClass(PolicyRepository),
    Binding.bind(UserServiceBindings.ROLE_MAPPING_REPOSITORY).toClass(RoleMappingRepository),
    Binding.bind(UserServiceBindings.USER_CREDENTIALS_REPOSITORY).toClass(UserCredentialsRepository),
    createBindingFromClass(SecuritySpecEnhancer),

    // authorization
    Binding.bind(AuthorizationTags.AUTHORIZER).to(
      AuthorizationTags.AUTHORIZER,
    ),
    Binding.bind(AuthorizationTags.CASBIN_ENFORCER).to(
      AuthorizationTags.CASBIN_ENFORCER,
    ),
    Binding.bind(AuthorizationTags.CASBIN_PROVIDER).to(
      AuthorizationTags.CASBIN_PROVIDER,
    ),
  ];

  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    registerAuthenticationStrategy(app, JWTAuthenticationStrategy);
  }
}
