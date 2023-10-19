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
  {
    id: 6,
    label: 'ADMIN',
    isTitle: true
  },
  {
    id: 12,
    label: 'Scheduler',
    link: '/planner/tasks',
    icon: 'ri ri-calendar-event-line'
  },
  {
    id: 7,
    label: 'Master Data',
    icon: 'ri-lock-2-line',
    subItems: [
      {
        id: 8,
        label: 'Activity',
        link: '/master/activity',
        parentId: 2
      },
      {
        id: 9,
        label: 'Machine Area',
        link: '/master/machine-area',
        parentId: 2
      },
      {
        id: 10,
        label: 'Area',
        link: '/master/area',
        parentId: 2
      },
    ]
  },
  {
    id: 11,
    label: 'Finding',
    link: '/finding',
    icon: 'ri ri-alert-line'
  }
  
  // {
  //   id: 179,
  //   label: 'MENUITEMS.MULTILEVEL.TEXT',
  //   icon: 'mdi mdi-share-variant-outline',
  //   subItems: [
  //     {
  //       id: 180,
  //       label: 'MENUITEMS.MULTILEVEL.LIST.LEVEL1.1',
  //       parentId: 179
  //     },
  //     {
  //       id: 181,
  //       label: 'MENUITEMS.MULTILEVEL.LIST.LEVEL1.2',
  //       subItems: [
  //         {
  //           id: 182,
  //           label: 'MENUITEMS.MULTILEVEL.LIST.LEVEL1.LEVEL2.1',
  //           parentId: 181,
  //         },
  //         {
  //           id: 183,
  //           label: 'MENUITEMS.MULTILEVEL.LIST.LEVEL1.LEVEL2.2',
  //           parentId: 181,
  //         }
  //       ]
  //     },
  //   ]
  // }

];
