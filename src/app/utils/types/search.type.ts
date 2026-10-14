import { User } from "../interfaces/user.interface";

export type SearchState =
  | { status: 'loading' }
  | { status: 'success'; users: User[] }
  | { status: 'error'; message: string };