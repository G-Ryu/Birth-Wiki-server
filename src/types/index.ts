export interface dailyData {
  id?: number;
  date?: string;
  image?: string;
  category?: string;
  like?: true;
  contents?: [string, string[]][];
}

export interface weeklyData {
  id?: number;
  date?: string;
  image?: string;
  like?: true;
  category?: string;
  korea?: culture;
  world?: culture;
}

export interface culture {
  title?: string;
  poster?: string;
  singer?: string;
}

export interface decodedRefresh {
  id: number;
}

export interface decodedAccess {
  nickName: string;
  exp: number;
  iat: number;
}
