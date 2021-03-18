import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaVotosComponent } from './mapa-votos.component';

describe('MapaVotosComponent', () => {
  let component: MapaVotosComponent;
  let fixture: ComponentFixture<MapaVotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapaVotosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapaVotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
