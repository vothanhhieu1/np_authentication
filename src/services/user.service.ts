import { inject } from '@loopback/core'
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {compare} from 'bcryptjs';
import {User, UserWithRelations, Role, RoleMapping, Policy, NewUserRequest} from '../models';
import {
  UserRepository,
  UserCredentialsRepository,
  RoleRepository,
  RoleMappingRepository,
  PolicyRepository,
} from '../repositories';
import { BasicUserService, ChangePasswordPayload, ResetPasswordPayload } from './basic-user.service'
import { PolicyService } from './policy.service'
import { JWTService } from './jwt.service'
import { TokenServiceBindings, UserServiceBindings } from '../keys'
import {genSalt, hash} from 'bcryptjs';
import _ from 'lodash'

export type Credentials = {
  username: string;
  password: string;
};

export async function hashPassword(password: string, rounds: number): Promise<string> {
  const salt = await genSalt(rounds);
  return hash(password, salt);
}

export class UserService implements BasicUserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(UserCredentialsRepository) public userCredentialsRepository: UserCredentialsRepository,
    @repository(RoleRepository) public roleRepository: RoleRepository,
    @repository(RoleMappingRepository) public roleMappingRepository: RoleMappingRepository,
    @repository(PolicyRepository) public policyRepository: PolicyRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: JWTService,
    @inject(UserServiceBindings.POLICY_SERVICE) public policyService: PolicyService,
  ) {}

  async comparePassword(password: string, hPassword: string) {
    const passwordMatched = await compare(password, hPassword);
    return passwordMatched
  }

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid email or password.';

    const foundUser = await this.userRepository.findOne({
      where: {username: credentials.username},
      include: [
        { relation: 'roles', scope: { include: [ { relation: 'policies' } ] } },
        { relation: 'policies' },
      ],
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await this.comparePassword(credentials.password, credentialsFound.password)

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  parseRules(policies: Policy[]) {
    const rules = policies.map(item => {
      const omit = _.omit(item, ['id', 'userId', 'roleId'])
      const values = Object.values(omit).filter(it => it)
      return values.join(',')
    })
    return rules
  }

  convertToUserProfile(user: User): UserProfile {
    const { roles, policies, username, email, id, organizer } = user
    let rules: string[] = []
    if (roles) {
      for (const role of roles) {
        const { policies: rolePolicies } = role
        if (rolePolicies) {
          const stringRules = this.parseRules(rolePolicies)
          const diff = _.difference(stringRules, rules)
          if (diff) {
            rules = [...rules, ...stringRules ]
          }
        }
      }
    }

    if (policies) {
      const stringRules = this.parseRules(policies)
      const diff = _.difference(stringRules, rules)
      if (diff) {
        rules = [...rules, ...stringRules ]
      }
    }

    return {
      [securityId]: id.toString(),
      name: username,
      id: id,
      email: email,
      rules,
      organizer 
    };
  }

  //function to find user by id
  async findUserById(id: number): Promise<User & UserWithRelations> {
    const userNotfound = 'invalid User';
    const foundUser = await this.userRepository.findById(id);

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(userNotfound);
    }
    return foundUser;
  }

  async assignRoles(
    userId: typeof User.prototype.id,
    roleIds: typeof Role.prototype.id[],
    organizer: number | string = '*'
  ): Promise<boolean> {
    const roleMappings: RoleMapping[] = []
    const policies: Policy[] = []
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    const roles = await this.roleRepository.find({ where: { id: { inq: roleIds } }})

    for (const role of roles) {
      const { id: roleId, name: roleName } = role
      roleMappings.push(new RoleMapping({ userId, roleId }))
      policies.push(new Policy({ pType: 'g', v0: `${organizer}`, v1: `${user.username}`, v2: roleName, userId }))
    }
    await this.roleMappingRepository.createAll(roleMappings)
    await this.policyRepository.createAll(policies)

    return true
  }

  async assignRoleNames(
    userId: typeof User.prototype.id,
    roleNames: typeof Role.prototype.name[],
    organizer: number | string = '*'
  ): Promise<boolean> {
    const roles = await this.roleRepository.find({ where: { name: { inq: roleNames } }})
    const roleIds = roles.map(it => it.id)
    await this.assignRoles(userId, roleIds, organizer)
    return true
  }

  async unAssignRole(
    userId: typeof User.prototype.id,
    roleId: typeof Role.prototype.id
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    const role = await this.roleRepository.findById(roleId)
    const { name: roleName } = role
    const roleMapping = await this.roleMappingRepository.findOne({ where: { userId, roleId } })
    if (roleMapping) {
      await this.roleMappingRepository.deleteById(roleMapping.id)
      const policy = await this.policyRepository.findOne({ where: { pType: 'g', v1: `${user.username}`, v2: roleName, userId }})
      if (policy) {
        await this.policyRepository.deleteById(policy.id)
      }
    }
    return true
  }

  async unAssignRoles(
    userId: typeof User.prototype.id,
    roleIds: typeof Role.prototype.id[]
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    const roles = await this.roleRepository.find({ where: { id: { inq: roleIds } }})

    for (const role of roles) {
      const { id: roleId, name: roleName } = role
      const roleMapping = await this.roleMappingRepository.findOne({ where: { userId, roleId } })
      if (roleMapping) {
        await this.roleMappingRepository.deleteById(roleMapping.id)
        const policy = await this.policyRepository.findOne({ where: { pType: 'g', v1: `${user.username}`, v2: roleName, userId }})
        if (policy) {
          await this.policyRepository.deleteById(policy.id)
        }
      }
    }
    return true
  }

  async login(credentials: Credentials) {
    const user = await this.verifyCredentials(credentials);
    const userProfile = this.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return { token, userProfile }
  }

  async changePassword(userId: number, payload: ChangePasswordPayload) {
    const { oldPassword, newPassword } = payload 
    const credentialsFound = await this.userRepository.findCredentials(userId)
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized();
    }

    const currentPassword = credentialsFound.password

    const passwordMatched = await this.comparePassword(oldPassword, currentPassword)
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Invalid password');
    }
    const password = await hashPassword(newPassword, 10)
    await this.userCredentialsRepository.updateById(credentialsFound.id, { password })

    return true
  }

  async resetPassword(userId: number, payload: ResetPasswordPayload) {
    const { oldPassword, newPassword } = payload 
    const credentialsFound = await this.userRepository.findCredentials(userId)
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized();
    }

    const currentPassword = credentialsFound.password

    const passwordMatched = await this.comparePassword(oldPassword, currentPassword)
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Invalid password');
    }
    const password = await hashPassword(newPassword, 10)
    await this.userCredentialsRepository.updateById(credentialsFound.id, { password })

    return true
  }

  async updateRoles(userId: number, roleIds: number[]) {
    const user = await this.userRepository.findById(userId, { include: [{ relation: 'roles' }] })
    const { roles = [], organizer } = user
    const currentRoleIds = roles.map(item => item.id)

    const unAssignRoleIds = _.difference(currentRoleIds, roleIds)
    const assignRoleIds = _.difference(roleIds, currentRoleIds)

    if (unAssignRoleIds) {
      await this.unAssignRoles(userId, unAssignRoleIds)
    }

    if (assignRoleIds) {
      await this.assignRoles(userId, assignRoleIds, organizer)
    }
    return true
  }

  async updatePolicies(userId: number, policies: Policy[]) {
    const user = await this.userRepository.findById(userId, { include: [ { relation: 'policies' } ] })
    if (!user) {
      throw new Error('User not found')
    }
    
    const { policies: currentPolicies, organizer, username } = user
    await this.policyService.updatePolicies(
      userId,
      'userId',
      username,
      organizer,
      policies,
      currentPolicies
    )
    return true
  }

  async updateProfile(userId: number, profile: User) {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const userProfile = _.omit(profile, ['id', 'organizer'])
    await this.userRepository.updateById(userId, { ...userProfile })

    return profile
  }

  async signUp(newUserRequest: NewUserRequest) {
    const password = await hash(newUserRequest.password, await genSalt());
    delete (newUserRequest as Partial<NewUserRequest>).password;
    const savedUser = await this.userRepository.create(newUserRequest);
    await this.userRepository.userCredentials(savedUser.id).create({password});

    return savedUser
  }

}
