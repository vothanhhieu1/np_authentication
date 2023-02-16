import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {genSalt, hash} from 'bcryptjs';
import {UserServiceBindings, Role, Policy, User} from '../..';
import {OPERATION_SECURITY_SPEC, SECURITY_SCHEME_SPEC} from '../../';
import {UserRepository} from '../../repositories';
import {UserService, RoleService, Credentials} from '../../services';
import {TestApplication} from '../fixtures/application';

describe('authentication', () => {
  let app: TestApplication;
  let client: Client;
  let token: string;
  let userRepo: UserRepository;
  let userService: UserService
  let roleService: RoleService
  before(givenRunningApplication);
  before(() => {
    client = createRestAppClient(app);
  });
  after(async () => {
    await app.stop();
  });

  it(`user login successfully`, async () => {
    const credentials = {email: 'jane@doe.com', password: 'opensesame'};
    const res = await client.post('/users/login').send(credentials).expect(200);
    token = res.body.token;
  });

  it('whoAmI returns the login user id', async () => {
    const res = await client
      .get('/whoAmI')
      .set('Authorization', 'Bearer ' + token)
      .expect(200);
    expect(res.text).to.equal('2');
  });

  it('generates openapi spec provided by enhancer', async () => {
    const spec = await app.restServer.getApiSpec();
    expect(spec.security).to.eql(OPERATION_SECURITY_SPEC);
    expect(spec.components?.securitySchemes).to.eql(SECURITY_SCHEME_SPEC);
  });

  /*
   ============================================================================
   TEST HELPERS
   ============================================================================
   */

  async function givenRunningApplication() {
    app = new TestApplication({
      rest: { ...givenHttpServerConfig(), port: 3000 },
    });

    await app.boot();
    userRepo = await app.get(UserServiceBindings.USER_REPOSITORY);
    userService = await app.get(UserServiceBindings.USER_SERVICE);
    roleService = await app.get(UserServiceBindings.ROLE_SERVICE);
    await app.migrateSchema({ existingSchema: 'drop' })
    await createRoles();
    await createUsers();
    await app.start();
  }

  async function createRoles(): Promise<void> {
    const roles: Role[] = [
      new Role({
        name: 'admin',
        policies: [
          new Policy({
            pType: 'p',
            v0: '1',
            v1: 'admin',
            v2: '*',
            v3: '*',
            v4: '*',
            v5: '*',
          })
        ],
      }),
      new Role({
        name: 'accounting',
        policies: [
          new Policy({
            pType: 'p',
            v0: '1',
            v1: 'accounting',
            v2: 'products',
            v3: 'read',
          }),
          new Policy({
            pType: 'p',
            v0: '1',
            v1: 'accounting',
            v2: 'orders',
            v3: 'read',
          })
        ],
      }),
      new Role({
        name: 'director',
        policies: [
          new Policy({
            pType: 'p',
            v0: '1',
            v1: 'director',
            v2: 'products',
            v3: '*',
          }),
          new Policy({
            pType: 'p',
            v0: '1',
            v1: 'director',
            v2: 'orders',
            v3: '*',
          })
        ],
      }),
      new Role({
        name: 'accounting',
        policies: [
          new Policy({
            pType: 'p',
            v0: '2',
            v1: 'accounting',
            v2: 'products',
            v3: 'read',
          }),
          new Policy({
            pType: 'p',
            v0: '2',
            v1: 'accounting',
            v2: 'orders',
            v3: 'read',
          })
        ],
      }),
    ];

    await roleService.createRolesWithPolicies(roles)
  }


  async function createUsers(): Promise<void> {
    const hashedPassword = await hashPassword('opensesame', 10);
    //providing UUID() to test
    const users = [
      {
        username: 'John',
        email: 'john@doe.com',
        password: hashedPassword,
        organizerId: 1,
        roles: ['admin']
      },
      {
        username: 'Jane',
        email: 'jane@doe.com',
        organizerId: 1,
        password: hashedPassword,
        roles: ['user', 'director']
      },
      {
        username: 'Bob',
        email: 'bob@projects.com',
        organizerId: 2,
        password: hashedPassword,
        roles: ['user']
      },
    ];

    for (const user of users) {
      const { email, username, roles, password, organizerId  } = user
      const saved = await userRepo.create(new User({ email, username, organizerId }));
      const { id: userId } = saved
      await userService.assignRoleNames(userId, roles, organizerId)
      await userRepo
        .userCredentials(userId)
        .create({password, userId});
    }
  }

  async function hashPassword(
    password: string,
    rounds: number,
  ): Promise<string> {
    const salt = await genSalt(rounds);
    return hash(password, salt);
  }
});
