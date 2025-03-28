interface APIResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

// The shape of the data for a widget
export interface WidgetType {
  id: number;
  name: string;
  description?: string;
  visibility?: string;
  status?: string;
  createdAt?: string;
  redirectLink?: string;
  imageUrl?: string;
  developerIds?: number[];
  publicId: string;
  restrictedAccess: boolean;
  categories: CategoryType[];
  metrics: {
    weeklyLaunches: number;
    yearlyLaunches: number;
    allTimeLaunches: number;
    monthlyLaunches: number;
    weeklyUniqueLaunches: number;
    yearlyUniqueLaunches: number;
    allTimeUniqueLaunches: number;
    monthlyUniqueLaunches: number;
  };
}

export interface CategoryType {
  id: number;
  name: string;
  hexCode?: string;
}

export interface RegisterWidgetDataType {
  widgetName: string; // The name of the widget
  description: string; // A description of the widget
  visibility: string; // Visibility status ('Public', 'Private', etc.)
}

export interface UserType {
  id: string;
  first: string;
  last: string;
  email: string;
  role: string;
  teamId: string;
  is_admin: string;
  [key: string]: string | undefined;
}

export type UserAPIResType = {
  authData: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    cognitoUserId: string;
  };
  user: UserType;
};

export interface PendingWidget {
  request_id: string;
  widget_name: string;
  description: string;
  visibility: string;
  status: string;
  created_at: string;
  approved_at: string;
  user_id: string;
}

export type PendingWidgetsAPIRes = APIResponse<PendingWidget[]>;

export interface AuthDataType {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface LoginType {
  user: UserType;
  authData: AuthDataType;
}

export type LoginAPIRes = APIResponse<LoginType>;

export type FavoritesAPIRes = APIResponse<number[]>;

export type CategoriesAPIRes = APIResponse<CategoryType[]>;

export interface PendingDeveloper {
  request_id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  status: string;
}

export interface WidgetCollaboratorsType {
  user_id: number;
  email: string;
  role: string; // "member" | "owner"
}
