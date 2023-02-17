import { UserService as AuthUserService } from '@loopback/authentication';
import { Policy, User, NewUserRequest } from '../models'

export type LoginResponse = {
  token: string
  userProfile: any
};

export type ChangePasswordPayload = {
  oldPassword: string
  newPassword: string
}

export type ResetPasswordPayload = {
  oldPassword: string
  newPassword: string
}

export interface BasicUserService<T, C> extends AuthUserService<T, C> {

  login(credential: C): Promise<LoginResponse>
  signUp(newUser: NewUserRequest): Promise<User>
  changePassword(userId: number, payload: ChangePasswordPayload): Promise<boolean>
  resetPassword(userId: number, payload: ResetPasswordPayload): Promise<boolean>
  updateRoles(userId: number, roleIds: number[]): Promise<boolean>
  updatePolicies(userId: number, policies: Policy[]): Promise<boolean>
  updateProfile(userId: number, profile: User): Promise<User>
}
