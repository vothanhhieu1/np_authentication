import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories/user.repository';
import {BcryptHasher} from './hash.password';
import {PasswordHasherBindings, TokenServiceBindings, UserServiceBindings} from '../keys';
import {JWTService} from './jwt-service';
import {validateCredentials} from '../services';
import _ from 'lodash'

export class MyUserService implements UserService<User, Credentials>{
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    // @inject('service.hasher')
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,

    // @inject('service.jwt.service')
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,

  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    // implement this method
    const foundUser = await this.userRepository.findOne({
      where: {
        username: credentials.username
      }
    });
    if (!foundUser) {
      throw new HttpErrors.NotFound('user not found');
    }
    const passwordMatched = await this.hasher.comparePassword(credentials.password, foundUser.password)
    if (!passwordMatched)
      throw new HttpErrors.Unauthorized('password is not valid');
    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    let userName = '';
    if (user.firstName)
      userName = user.firstName;
    if (user.lastName) {
      userName = user.firstName ? `${user.firstName} ${user.lastName}` : user.lastName;
    }
    return {
      [securityId]: user.id!.toString(),
      name: userName,
      id: user.id,
      email: user.email
    };
    // throw new Error('Method not implemented.');
  }

  async login(credentials: Credentials): Promise<{token: string}> {
    // make sure user exist,password should be valid
    const user = await this.verifyCredentials(credentials);
    // console.log(user);
    const userProfile = this.convertToUserProfile(user);
    // console.log(userProfile);

    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({token: token})
  }

  async signup(userData: User) {
    validateCredentials(_.pick(userData, ['username', 'password']));
    userData.password = await this.hasher.hashPassword(userData.password)
    const savedUser = await this.userRepository.create(userData);
    delete savedUser.password;
    return savedUser;
  }
}
