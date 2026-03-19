import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dimensions/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard — The Observer Effect'
  },
  {
    path: 'career',
    loadComponent: () =>
      import('./dimensions/career-graph/career-graph.component').then(m => m.CareerGraphComponent),
    title: 'Career — The Observer Effect'
  },
  {
    path: 'lab',
    loadComponent: () =>
      import('./dimensions/lab/lab.component').then(m => m.LabComponent),
    title: 'Research — The Observer Effect'
  },
  { path: 'neural', redirectTo: 'career', pathMatch: 'full' },
  {
    path: 'repository',
    loadComponent: () =>
      import('./dimensions/repository/repository.component').then(m => m.RepositoryComponent),
    title: 'Projects — The Observer Effect'
  },
  {
    path: 'theory',
    loadComponent: () =>
      import('./dimensions/theory/theory.component').then(m => m.TheoryComponent),
    title: 'Theoretical Computing — The Observer Effect'
  },
  {
    path: 'achievements',
    loadComponent: () =>
      import('./dimensions/achievements/achievements.component').then(m => m.AchievementsComponent),
    title: 'Achievements — The Observer Effect'
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./dimensions/blog/blog.component').then(m => m.BlogComponent),
    title: 'Blog — The Observer Effect'
  },
  { path: '**', redirectTo: '' }
];
