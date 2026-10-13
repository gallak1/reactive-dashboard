import { Component, computed, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { UserService } from '../services/user.service';

export interface User {
  id: number;
  name: string;
  active: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private readonly userService = inject(UserService);

  usersResource = httpResource<User[]>(
    () => this.userService.getUsersUrl()
  );

  searchTerm = signal('');
  showActiveOnly = signal(false);

  totalUsers = computed(() => {
    if (!this.usersResource.hasValue()) return 0;
    return this.usersResource.value().length;
  });

  activeUsers = computed(() => {
    if (!this.usersResource.hasValue()) return 0;

    return this.usersResource.value()
      .filter(user => user.active).length;
  });

  filteredUsers = computed(() => {
    if (!this.usersResource.hasValue()) return [];

    const term = this.searchTerm().toLowerCase();

    return this.usersResource.value().filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(term);

      const matchesStatus =
        !this.showActiveOnly() || user.active;

      return matchesSearch && matchesStatus;
    });
  });

  toggleActiveOnly() {
    this.showActiveOnly.update(value => !value);
  }

  setSearchTerm(term: string) {
    this.searchTerm.set(term);
  }
}