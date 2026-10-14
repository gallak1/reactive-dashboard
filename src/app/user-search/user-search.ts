import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, Subject, switchMap } from 'rxjs';
import { User } from '../utils/interfaces/user.interface';
import { SearchState } from '../utils/types/search.type';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-user-search',
  styleUrl: './user-search.css',
  templateUrl: './user-search.html',
  standalone: true
})
export class UserSearch {

  private readonly http = inject(HttpClient);

  readonly searchControl = new FormControl('', {
    nonNullable: true,
  });

  readonly error = signal<string>('');

  readonly users = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.error.set('');
        
        return this.http.get<User[]>(
          `/api/search/users?search=${encodeURIComponent(term)}`
        ).pipe(
          catchError(error => {
            this.error.set('Erro ao buscar usuários.');
            return of([]);
          })
        )
      }
      )
    ),
    { initialValue: [] }
  );

}
