import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: 'ACTIVITY CILT',
    isTitle: true
  },
  {
    id: 2,
    label: 'Dashboard',
    link: '',
    icon: 'ri ri-dashboard-fill',
  },
  // {
  //   id: 3,
  //   label: 'Achievements',
  //   link: '/achievements',
  //   icon: 'ri ri-trophy-fill',
  // },
  // {
  //   id: 4,
  //   label: 'Testing Page',
  //   link: '/testing',
  //   icon: 'ri ri-settings-line',
  // },
  {
    id: 5,
    label: 'Tasks',
    link: '/tasks',
    icon: 'ri ri-task-line'
  },
];
