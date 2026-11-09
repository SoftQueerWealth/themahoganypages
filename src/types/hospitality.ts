export interface HospitalityItem {
  id: string;
  city: string;
  business: string;
  venueType: string;
  uiCategory: string;
  audienceTags: string[];
  vibeTags: string[];
  description: string;
  venueName: string;
  venueAddress: string;
  nearbyStation: string;
  price: string;
  hasCommunityPerk: boolean;
  code: string;
  bookingLink: string;
  prideSeries: string;
  credit: string;
  creditSourceLink: string;
  /** Type of Care labels from the sexual wellness sheet. */
  careTypes?: string[];
  /** Visitor-facing tip from the sheet Pro Tip column. */
  proTip?: string;
}
