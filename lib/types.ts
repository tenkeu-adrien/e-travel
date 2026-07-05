export type TripStatus = "open" | "urgent" | "full";

export interface Trip {
  id: string;
  agencyId?: string;
  agency: string;
  code: string;
  color: string;
  depH: string;
  arrH: string;
  dur: string;
  depart: string;
  arrive: string;
  depStop: string;
  arrStop: string;
  price: number;
  seats: number;
  total: number;
  rating: number;
  reviews: number;
  status: TripStatus;
  amenities: string[];
  date?: string;
  createdAt?: string;
}

export type PageKey =
  | "home"
  | "results"
  | "detail"
  | "payment"
  | "confirm"
  | "agency"
  | "agency-login"
  | "seed";

export type PaymentMethod = "orange" | "mtn" | "card";

export interface BookingInfo {
  prenom: string;
  nom: string;
  phone: string;
  ref: string;
}
