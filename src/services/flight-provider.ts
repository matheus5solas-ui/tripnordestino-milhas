import type { FlightOffer, FlightSearch } from "@/types/travel";

/** Contrato para APIs autorizadas de voos. Nenhum scraping ou programa de fidelidade é integrado. */
export interface FlightOfferProvider {
  search(criteria: FlightSearch): Promise<FlightOffer[]>;
}

export class MockFlightOfferProvider implements FlightOfferProvider {
  constructor(private readonly offers: FlightOffer[]) {}

  async search(criteria: FlightSearch): Promise<FlightOffer[]> {
    return this.offers.filter((offer) => {
      const withinCash = !criteria.maxCashPrice || offer.cashPrice <= criteria.maxCashPrice;
      const withinMiles = !criteria.maxMiles || (offer.milesPrice !== undefined && offer.milesPrice <= criteria.maxMiles);
      return withinCash && withinMiles;
    });
  }
}
