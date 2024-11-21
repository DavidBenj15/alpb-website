// The shape of the data for a widget
export type WidgetType = {
  id: number;
  name: string;
  description?: string;
  visibility?: string;
  status?: string;
  createdAt?: string;
  redirectLink?: string;
  imageUrl?: string;
  categoryIds?: number[];
  developerIds?: string[];
};
