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
  is_admin: boolean;
  [key: string]: string | boolean | undefined;
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

export interface TeamMember {
  user_id: string;
  first: string;
  last: string;
  email: string;
  is_admin: boolean;
  team_role: string;
  team_id: string;
  team_name: string;
}

export interface LeagueStandingsData {
  updatedAt: string;
  year: string;
  standings: Standings;
}

export interface Standings {
  leagueid: string;
  leaguename: string;
  leagueshortname: string;
  season: Season;
  conference: Conference[];
}

export interface Season {
  seasonid: string;
  seasonname: string;
  seasonshortname: string;
}

export interface Conference {
  name: string;
  division: Division[];
}

export interface Division {
  divisionid: string;
  name: string;
  team: Team[];
}

export interface Team {
  teamlinkid: string;
  teamid: string;
  teamname: string;
  shortname: string;
  wins: string;
  losses: string;
  pct: string;
  gb: Record<string, unknown>; // Placeholder for empty object; update if structure is known
  streak: string;
  last10: string;
}

export interface LeagueLeadersData {
  updatedAt: string;
  year: string;
  stats: {
    link: string;
    season: string;
    pitching: {
      player: PitchingPlayer[];
    };
    batting: {
      player: BattingPlayer[];
    };
  };
}

export interface PitchingPlayer {
  playerlinkid: string;
  playerid: string;
  jersey: string;
  playername: string;
  firstname: string;
  lastname: string;
  teamname: TeamName;
  wins: string;
  losses: string;
  ip: string;
  runs: string;
  er: string;
  hits: string;
  bb: string;
  so: string;
  bf: string;
  games: string;
  gs: string;
  cg: string;
  cgl: string;
  sho: string;
  sv: string;
  bsv: string;
  oobp: string;
  oslg: string;
  oavg: string;
  era: string;
}

export interface BattingPlayer {
  playerlinkid: string;
  playerid: string;
  jersey: string;
  playername: string;
  firstname: string;
  lastname: string;
  teamname: TeamName;
  position: string;
  ab: string;
  runs: string;
  hits: string;
  bib: string;
  trib: string;
  hr: string;
  rbi: string;
  bb: string;
  hp: string;
  so: string;
  sf: string;
  sb: string;
  dp: string;
  obp: string;
  slg: string;
  avg: string;
}

export interface TeamName {
  id: string;
  teamlinkid: string;
  teamid: string;
  fullname: string;
  $t: string;
}
