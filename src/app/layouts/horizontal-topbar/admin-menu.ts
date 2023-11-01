import { MenuItem } from "./menu.model";

export const ADMIN_MENU: MenuItem[] = [
  {
    id: 6,
    label: "ADMIN",
    isTitle: true,
  },
  {
    id: 12,
    label: "Scheduler",
    link: "/planner/tasks",
    icon: "ri ri-calendar-event-line",
  },
  {
    id: 7,
    label: "Master Data",
    icon: "ri-lock-2-line",
    subItems: [
      {
        id: 8,
        label: "Activity",
        link: "/master/activity",
        parentId: 2,
      },
      {
        id: 9,
        label: "Machine Area",
        link: "/master/machine-area",
        parentId: 2,
      },
      {
        id: 10,
        label: "Area",
        link: "/master/area",
        parentId: 2,
      },
    ],
  },
  {
    id: 11,
    label: "Finding",
    link: "/planner/finding",
    icon: "ri ri-alert-line",
  },
];
