export interface Cat {
  _id: string;
  name: string;
  breed: string;
  description: string;
  kidsFriendly: boolean;
  apartmentFriendly: boolean;
  lifeSpan: number;
  energyLevel: string;
  image?: string;
  color?: string;
  size?: string;
  violenceLevel?: string;
  foodHabits?: string;
  tailSize?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CatInput = Omit<Cat, "_id" | "createdAt" | "updatedAt">;

export interface Preferences {
  kidsFriendly: boolean;
  apartmentFriendly: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}
