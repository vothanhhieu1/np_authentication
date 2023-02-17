import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {TestApplication} from '../fixtures/application';

describe('authorization', () => {
  let app: TestApplication;
  let client: Client;
  let token: string;
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

  it('Allow find all product', async () => {
    await client
      .get('/products')
      .set('Authorization', 'Bearer ' + token)
      .expect(200);
  });

  it('Allow create product', async () => {
    await client
      .post('/products')
      .set('Authorization', 'Bearer ' + token)
      .expect(200);
  });

  it('Deny find all employees', async () => {
    await client
      .get('/employees')
      .set('Authorization', 'Bearer ' + token)
      .expect(403);
  });

  it('Deny create employee', async () => {
    await client
      .post('/employees')
      .set('Authorization', 'Bearer ' + token)
      .expect(403);
  });

  async function givenRunningApplication() {
    app = new TestApplication({
      rest: { ...givenHttpServerConfig(), port: 3000 },
    });

    await app.boot();
    await app.start();
  }
});
