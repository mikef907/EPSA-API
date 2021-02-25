export class Event {
  id!: number;
  parentId?: number;
  name!: string;
  description!: string;
  allDay!: boolean;
  start_date!: Date;
  end_date?: Date;
  created_at!: Date;
  updated_at!: Date;
}
