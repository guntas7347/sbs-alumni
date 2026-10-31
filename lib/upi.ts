import {
  createUpiPaymentUri,
  generateUpiQrDataUrl,
} from "upi-qr-code-generator";

export async function generateUpiQR(
  transactionNote: string,
  transactionRef: string,
) {
  const payment = {
    payeeVpa: "sbibhim.022211900793125-ym668107@sbipay",
    payeeName: "INCHARGE ALUMNI SBS STATE",
    amount: "1000.00",
    transactionRef,
    transactionNote,
  };
  const uri = createUpiPaymentUri(payment);

  const qrImage = await generateUpiQrDataUrl(payment);
  return { uri, qrImage };
}

export function isValidUpiTransactionId(txId: string) {
  // Matches exactly 12 numeric digits
  const upiTxIdRegex = /^\d{12}$/;
  return upiTxIdRegex.test(txId);
}
