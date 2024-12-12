// The shape of the data for a widget
export type WidgetType = {
  id: number;
  name: string;
  description?: string;
  visibility?: string;
  status?: string;
  createdAt?: string;
  redirectUrl?: string;
  imageUrl?: string;
  categoryIds?: number[];
  developerIds?: string[];
};

export type UserType = {
  id: string;
  first: string;
  last: string;
  email: string;
  role: string;
}

export type UserAPIResType = {
  authData: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    cognitoUserId: string;
  },
  user: UserType;
}
