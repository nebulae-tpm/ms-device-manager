export interface Tag{
  name: string;
  type: string;
  attributes: TagAttribute [];
}

export interface TagAttribute{
  key: string;
  value: string;
  editing?: boolean;
  currentValue: { key?: string, value?: string };
}
