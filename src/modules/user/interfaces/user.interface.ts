import { IProfilePic } from './profile-pic.interfaces';

export interface IUser {
  id?: number;
  name: string;
  email: string;
  password?: string;
  profilePic?: IProfilePic;
}
