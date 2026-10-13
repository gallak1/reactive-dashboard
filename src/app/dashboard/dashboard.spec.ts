import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  provideHttpClient
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('deve exibir os usuários e calcular as métricas após o sucesso da API', async () => {
    fixture.detectChanges();

    const request = httpTesting.expectOne('/api/users');

    expect(request.request.method).toBe('GET');

    request.flush([
      { id: 1, name: 'Gabriel', active: true },
      { id: 2, name: 'João', active: false },
      { id: 3, name: 'Maria', active: true },
      { id: 4, name: 'Carlos', active: true }
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const text = element.textContent ?? '';

    expect(text).toContain('Gabriel');
    expect(text).toContain('João');
    expect(text).toContain('Maria');
    expect(text).toContain('Carlos');

    expect(text).toContain('4 no total');
    expect(text).toContain('3 ativos');
  });

  it('deve exibir erro quando a API falhar', async () => {
    fixture.detectChanges();

    const request = httpTesting.expectOne('/api/users');

    request.flush(
      { message: 'Erro interno do servidor' },
      {
        status: 500,
        statusText: 'Internal Server Error'
      }
    );

    await fixture.whenStable();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('[role="alert"]'))
      .not.toBeNull();

    expect(element.textContent)
      .toContain('Não foi possível carregar os usuários.');

    expect(element.textContent)
      .toContain('Tentar novamente');
  });

  it('deve tentar novamente após a falha na API e exibir os usuários corretamente', async () => {
    fixture.detectChanges();
    const errorRequest = httpTesting.expectOne('/api/users');

    errorRequest.flush(
      { message: 'Erro interno do servidor' },
      {
        status: 500,
        statusText: 'Internal Server Error'
      }
    );

    await fixture.whenStable();
    fixture.detectChanges();

    const elementOnError: HTMLElement = fixture.nativeElement;
    const textOnError = elementOnError.textContent ?? '';

    expect(elementOnError.querySelector('[role="alert"]'))
      .not.toBeNull();
    expect(textOnError)
      .toContain('Não foi possível carregar os usuários.');
    expect(textOnError)
      .toContain('Tentar novamente');

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    button.click();

    fixture.detectChanges();

    const successRequest = httpTesting.expectOne('/api/users');
    successRequest.flush([
      { id: 1, name: 'Gabriel', active: true },
      { id: 3, name: 'Maria', active: true },
    ]);

    await fixture.whenStable(); 
    fixture.detectChanges();

    const elementOnSuccess: HTMLElement = fixture.nativeElement;
    const textOnSuccess = elementOnSuccess.textContent ?? '';

    expect(elementOnSuccess.querySelector('[role="alert"]'))
      .toBeNull();

    expect(textOnSuccess).toContain('Gabriel');
    expect(textOnSuccess).toContain('Maria');
    expect(textOnSuccess).toContain('2 no total');
    expect(textOnSuccess).toContain('2 ativos');
  });
  
  it('deve filtrar usuários ativos e aplicar a busca por nome', async () => {
    fixture.detectChanges();

    const request = httpTesting.expectOne('/api/users');

    request.flush([
      { id: 1, name: 'Gabriel', active: true },
      { id: 2, name: 'João', active: false },
      { id: 3, name: 'Maria', active: true },
      { id: 4, name: 'Carlos', active: true },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const checkbox: HTMLInputElement = element.querySelector('input[type="checkbox"]') as HTMLInputElement;

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));

    fixture.detectChanges();

    const displayedActiveNames = Array.from(
      element.querySelectorAll('tbody tr')
    ).map(row =>
      row.querySelector('td')?.textContent?.trim()
    );

    expect(displayedActiveNames).toEqual([
      'Gabriel',
      'Maria',
      'Carlos',
    ]);

    const searchInput: HTMLInputElement = element.querySelector('input[type="search"]') as HTMLInputElement;
    searchInput.value = 'Maria';
    searchInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const displayedSearchedNames = Array.from(
      element.querySelectorAll('tbody tr')
    ).map(row =>
      row.querySelector('td')?.textContent?.trim()
    );

    expect(displayedSearchedNames).toEqual([
      'Maria',
    ]);
  });
  
  it('deve informar que ainda não há usuários cadastrados', async () => {
    fixture.detectChanges();

    const request = httpTesting.expectOne('/api/users');
    request.flush([]);

    await fixture.whenStable();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const text = element.textContent ?? '';

    expect(text).toContain('Ainda não há usuários cadastrados.');
    expect(text).not.toContain(
      'Nenhum usuário encontrado com esses filtros.'
    );
    expect(element.querySelector('[role="alert"]'))
      .toBeNull();
  });

  it('deve informar que não encontrou resultados na busca mas com resultados válidos', async () => {
    fixture.detectChanges();

    const request = httpTesting.expectOne('/api/users');
    request.flush([
      { id: 1, name: 'Gabriel', active: true },
      { id: 4, name: 'Carlos', active: true }
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    const searchInput: HTMLInputElement = element.querySelector('input[type="search"]') as HTMLInputElement;
    searchInput.value = 'Roberto';
    searchInput.dispatchEvent(new Event('input'));
    
    fixture.detectChanges();
    
    const text = element.textContent ?? '';

    expect(text).toContain(
      'Nenhum usuário encontrado com esses filtros.'
    );
    expect(text).not.toContain('Ainda não há usuários cadastrados.');
    expect(element.querySelector('[role="alert"]'))
      .toBeNull();
  });

  it('deve atualizar a tabela de usuários e garantir que os dados mudaram', async () => {
    fixture.detectChanges();

    const request = httpTesting.expectOne('/api/users');
    request.flush([
      { id: 1, name: 'Gabriel', active: true },
      { id: 3, name: 'Maria', active: true },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    const displayedNamesBeforeUpdate = Array.from(
      element.querySelectorAll('tbody tr')
    ).map(row =>
      row.querySelector('td')?.textContent?.trim()
    );

    expect(displayedNamesBeforeUpdate).toEqual([
      'Gabriel', 'Maria',
    ]);

    const updateButton = Array.from(
      element.querySelectorAll('button')
    ).find(button =>
      button.textContent?.includes('Atualizar usuários')
    );

    expect(updateButton).toBeDefined();
    updateButton!.click();

    fixture.detectChanges();

    const request2 = httpTesting.expectOne('/api/users');
    request2.flush([
      { id: 2, name: 'João', active: false },
      { id: 4, name: 'Carlos', active: true }
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const displayedNamesAfterUpdate = Array.from(
      element.querySelectorAll('tbody tr')
    ).map(row =>
      row.querySelector('td')?.textContent?.trim()
    );

    expect(displayedNamesAfterUpdate).toEqual([
      'João', 'Carlos',
    ]);
  });
});
