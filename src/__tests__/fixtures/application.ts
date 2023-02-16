// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {RestExplorerComponent} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import { AuthenticationComponent } from '@loopback/authentication'
import { AuthorizationComponent } from '@loopback/authorization'
import {
  AuthComponent,
  UserServiceBindings,
  UserRepository,
  UserCredentialsRepository,
  PolicyRepository,
  RoleMappingRepository,
  RoleRepository,
  AuthorizationTags
} from '../../';
import {DbDataSource} from './datasources/db.datasource';
import {MySequence} from './sequence';
import {CasbinAuthorizationProvider, CasbinEnforcer} from '../../services';

export class TestApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // - enable jwt auth -
    // Mount authentication system
    this.component(AuthenticationComponent);
    // Authorization
    this.component(AuthorizationComponent);
    this.bind(AuthorizationTags.CASBIN_ENFORCER).toClass(CasbinEnforcer)
    this
    .bind(AuthorizationTags.CASBIN_PROVIDER)
    .toProvider(CasbinAuthorizationProvider)
    .tag(AuthorizationTags.AUTHORIZER)

    // Mount jwt component
    this.component(AuthComponent);
    // Bind datasource
    this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);

    this.repository(UserRepository)
    this.repository(UserCredentialsRepository)
    this.repository(PolicyRepository)
    this.repository(RoleRepository)
    this.repository(RoleMappingRepository)

    this.component(RestExplorerComponent);
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
      repositories: {
        dirs: ['repositories'],
        extensions: ['.repository.js'],
        nested: true,
      },
    };
  }
}
