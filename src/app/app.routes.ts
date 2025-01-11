import { Routes } from '@angular/router';
import { TripListPageComponent } from './pages/trip-list-page/trip-list-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { TripViewerPageComponent } from './pages/trip-viewer-page/trip-viewer-page.component';

export const routes: Routes = [
  { path: '', component: TripListPageComponent },
  { path: 'trip/:directoryName', component: TripViewerPageComponent },
  { path: '**', component: NotFoundPageComponent },
];
