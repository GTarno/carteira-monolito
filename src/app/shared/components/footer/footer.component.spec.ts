import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display developer name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.developed-by')?.textContent).toContain('Giovanna Tarno');
  });

  it('should have LinkedIn link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const linkedinLink = compiled.querySelector('a[href*="linkedin.com"]');
    expect(linkedinLink).toBeTruthy();
    expect(linkedinLink?.getAttribute('href')).toBe('https://www.linkedin.com/in/giovanna-tarno/');
  });

  it('should have GitHub link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const githubLink = compiled.querySelector('a[href*="github.com"]');
    expect(githubLink).toBeTruthy();
    expect(githubLink?.getAttribute('href')).toBe('https://github.com/GTarno');
  });

  it('should display project information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.project-description')?.textContent).toContain('Fatec Zona Leste');
    expect(compiled.querySelector('.project-description')?.textContent).toContain('2026');
  });
});