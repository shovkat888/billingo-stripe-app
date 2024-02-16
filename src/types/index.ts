export interface IPartner {
  id: number;
  name: string;
  emails: string[];
  taxcode?: string;
  phone?: string;
}

export interface IProduct {
  id: number;
  name: string;
  comment?: string;
  vat?: string;
}

export interface IBankAccount {
  id: number;
  name: string;
  account_number: string;
  currency: string;
}

export interface IDocumentBlock {
  id: number;
  name: string;
}
