import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaLeitosComponent } from './mapa-leitos.component';

describe('MapaLeitosComponent', () => {
  let component: MapaLeitosComponent;
  let fixture: ComponentFixture<MapaLeitosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapaLeitosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapaLeitosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
