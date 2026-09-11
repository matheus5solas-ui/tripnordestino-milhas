export type OfferRegion = "Brasil" | "Internacional";

export interface FlightOffer {
  id: string;
  destination: string;
  airport: string;
  route: string;
  dates: string;
  cashPrice: number;
  milesPrice?: number;
  tag: "Ótimo preço" | "Oferta";
  region: OfferRegion;
  theme: string;
}

export interface FlightSearch {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  paymentMode: "cash" | "miles" | "compare";
  maxCashPrice?: number;
  maxMiles?: number;
}

export interface PriceAlert {
  origin: string;
  destinationScope: string;
  maxCashPrice?: number;
  maxMiles?: number;
  enabled: boolean;
}
