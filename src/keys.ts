import {TokenService, UserService as AuthUserService} from '@loopback/authentication';
import {BindingKey} from '@loopback/core';
import {RoleService, UserService, PolicyService} from './services';
import {RefreshTokenService} from './types';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = 'myjwts3cr3t';
  export const TOKEN_EXPIRES_IN_VALUE = '21600';
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );
  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.tokenservice',
  );
}

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService>(
    'services.user.service',
  );

  export const ROLE_SERVICE = BindingKey.create<RoleService>(
    'services.role.service',
  );

  export const POLICY_SERVICE = BindingKey.create<PolicyService>(
    'services.policy.service',
  );

  export const DATASOURCE_NAME = 'jwtdb';
  export const ROLE_REPOSITORY = 'repositories.RoleRepository';
  export const ROLE_MAPPING_REPOSITORY = 'repositories.RoleMappingRepository';
  export const POLICY_REPOSITORY = 'repositories.PolicyRepository';
  export const USER_REPOSITORY = 'repositories.UserRepository';
  export const USER_CREDENTIALS_REPOSITORY =
    'repositories.UserCredentialsRepository';
}

export namespace CasbinServiceBindings {
  export const DATABASE_CONNECTION_STRING = 'database_connection_string'
}

/**
 * Constant values used when generating refresh token.
 */
export namespace RefreshTokenConstants {
  /**
   * The default secret used when generating refresh token.
   */
  export const REFRESH_SECRET_VALUE = 'r3fr35htok3n';
  /**
   * The default expiration time for refresh token.
   */
  export const REFRESH_EXPIRES_IN_VALUE = '216000';
  /**
   * The default issuer used when generating refresh token.
   */
  export const REFRESH_ISSUER_VALUE = 'loopback4';
}

/**
 * Bindings related to token refresh service. The omitted explanation can be
 * found in namespace `RefreshTokenConstants`.
 */
export namespace RefreshTokenServiceBindings {
  export const REFRESH_TOKEN_SERVICE = BindingKey.create<RefreshTokenService>(
    'services.authentication.jwt.refresh.tokenservice',
  );
  export const REFRESH_SECRET = BindingKey.create<string>(
    'authentication.jwt.refresh.secret',
  );
  export const REFRESH_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.refresh.expires.in.seconds',
  );
  export const REFRESH_ISSUER = BindingKey.create<string>(
    'authentication.jwt.refresh.issuer',
  );
  /**
   * The backend datasource for refresh token's persistency.
   */
  export const DATASOURCE_NAME = 'refreshdb';
  /**
   * Key for the repository that stores the refresh token and its bound user
   * information
   */
  export const REFRESH_REPOSITORY = 'repositories.RefreshTokenRepository';
}

export const RESOURCE_ID = BindingKey.create<string>('resourceId');

export  namespace AuthorizationTags {
  export const AUTHORIZER = "authorizer";
  export const CASBIN_ENFORCER = 'casbin.enforcer.factory'
  export const CASBIN_PROVIDER = 'authorizationProviders.casbin-provider'
}

