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
  {
    id: 3,
    label: 'Tasks',
    link: '/tasks',
    icon: 'ri ri-task-line'
  },
];

export const ADMIN_MENU: MenuItem[] = [
  {
    id: 6,
    label: "ADMIN",
    isTitle: true,
  },
  {
    id: 7,
    label: "Scheduler",
    link: "/planner/tasks",
    icon: "ri ri-calendar-event-line",
  },
  {
    id: 8,
    label: "Master Data",
    icon: "ri-lock-2-line",
    subItems: [
      {
        id: 10,
        label: "Activity",
        link: "/master/activity",
        parentId: 2,
      },
      {
        id: 11,
        label: "Machine Area",
        link: "/master/machine-area",
        parentId: 2,
      },
      {
        id: 12,
        label: "Area",
        link: "/master/area",
        parentId: 2,
      },
      {
        id: 13,
        label: "Users",
        link: "/master/users",
        parentId: 2,
      },
    ],
  },
  {
    id: 9,
    label: "Finding",
    link: "/planner/finding",
    icon: "ri ri-alert-line",
  },
];
