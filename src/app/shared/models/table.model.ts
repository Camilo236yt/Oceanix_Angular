export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'badge' | 'date' | 'actions';
  width?: string;
  align?: 'left' | 'center' | 'right';
  badgeConfig?: {
    [key: string]: {
      color: string;
      bgColor: string;
      dotColor?: string;
    };
  };
}

export interface TableAction {
  icon: string;
  label: string;
  action: (row: any) => void;
  color?: string;
}
