export abstract class INonce {
  nonce!: string;
  userId!: number;
  expiry!: Date;
  used!: boolean;
  created_at!: Date;
  updated_at!: Date;
}
