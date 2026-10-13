import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = '/api/users';

  getUsersUrl(): string {
    return this.baseUrl;
  }
}