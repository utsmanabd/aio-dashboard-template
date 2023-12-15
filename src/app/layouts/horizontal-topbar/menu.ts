import { MenuItem } from './menu.model';

let menuId = 0;
export function createMenuId() {
  return menuId++;
}

export const MENU: MenuItem[] = [
  {
    id: createMenuId(),
    label: 'MAIN',
    isTitle: true
  },
  {
    id: createMenuId(),
    label: 'Dashboard',
    link: '',
    icon: 'ri ri-dashboard-fill',
  },
  {
    id: createMenuId(),
    label: 'EXECUTOR',
    isTitle: true
  },
  {
    id: createMenuId(),
    label: 'Tasks',
    link: '/tasks',
    icon: 'ri ri-task-line'
  },
];

export const PLANNER_MENU: MenuItem[] = [
  {
    id: createMenuId(),
    label: "PLANNER",
    isTitle: true,
  },
  {
    id: createMenuId(),
    label: "Scheduler",
    link: "/planner/tasks",
    icon: "ri ri-calendar-event-line",
  },
  // {
  //   id: createMenuId(),
  //   label: "Finding",
  //   link: "/planner/finding",
  //   icon: "ri ri-alert-line",
  // },
]

export const ADMIN_MENU: MenuItem[] = [
  {
    id: createMenuId(),
    label: "ADMIN",
    isTitle: true,
  },
  {
    id: createMenuId(),
    label: "Master Data",
    icon: "ri-lock-2-line",
    subItems: [
      {
        id: createMenuId(),
        label: "Activity",
        link: "/master/activity",
        parentId: 2,
      },
      {
        id: createMenuId(),
        label: "Machine Area",
        link: "/master/machine-area",
        parentId: 2,
      },
      {
        id: createMenuId(),
        label: "Area",
        link: "/master/area",
        parentId: 2,
      },
      {
        id: createMenuId(),
        label: "Users",
        link: "/master/users",
        parentId: 2,
      },
    ],
  },
];
