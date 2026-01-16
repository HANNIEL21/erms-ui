declare module "@paystack/inline-js" {
  export default class PaystackPop {
    constructor();
    resumeTransaction(
      accessCode: string,
      opts?: {
        onSuccess?: () => void;
        onError?: (error?: any) => void;
      }
    ): void;
  }
}
