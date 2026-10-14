import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSearch } from './user-search';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('UserSearch', () => {
  let fixture: ComponentFixture<UserSearch>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSearch],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserSearch);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('deve cancelar uma requisição e refazê-la com o novo termo pesquisado', async() => {
    fixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 350));
    const request = httpTesting.expectOne('/api/search/users?search=');

    expect(request.request.method).toBe('GET');

    request.flush([]);

    await fixture.whenStable();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const searchInput: HTMLInputElement = element.querySelector('input[type="search"]') as HTMLInputElement;
    searchInput.value = 'Maria';
    searchInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 350));

    const requestMaria = httpTesting.expectOne('/api/search/users?search=Maria');

    searchInput.value = 'Carlos';
    searchInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 350));

    const requestCarlos = httpTesting.expectOne('/api/search/users?search=Carlos');

    expect(requestMaria.cancelled).toBe(true);

    requestCarlos.flush([
      { id: 4, name: 'Carlos', active: true }
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const text = element.textContent ?? '';

    expect(text).toContain('Carlos');
  });

  it('deve apresentar erro na requisição e limpar o erro em uma nova requisição com sucesso', async () => {
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const searchInput: HTMLInputElement = element.querySelector('input[type="search"]') as HTMLInputElement;
    searchInput.value = 'Maria';
    searchInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 350));

    const requestMaria = httpTesting.expectOne('/api/search/users?search=Maria');
    requestMaria.flush(
      { message: 'Erro interno do servidor' },
      {
        status: 500,
        statusText: 'Internal Server Error'
      }
    );

    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent)
    .toContain('Erro ao buscar usuários.');

    searchInput.value = 'Carlos';
    searchInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 350));

    const requestCarlos = httpTesting.expectOne('/api/search/users?search=Carlos');
    requestCarlos.flush([
      { id: 4, name: 'Carlos', active: true }
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const text = element.textContent ?? '';

    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(text).toContain('Carlos');
  });
});
