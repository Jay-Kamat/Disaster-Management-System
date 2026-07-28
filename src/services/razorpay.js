import confetti from 'canvas-confetti';
import { store } from './store';

export function triggerRazorpayCheckout(amount, incidentTitle, user = null, onSuccess) {
  const numAmount = Number(amount);
  if (!numAmount || numAmount < 10) {
    alert("Please enter a valid donation amount (Minimum ₹10).");
    return;
  }

  // Simulated Razorpay Modal Payment Handler
  const paymentId = `pay_RZP_${Math.floor(100000000 + Math.random() * 900000000)}`;

  const confirmPayment = window.confirm(
    `[RAZORPAY SECURE CHECKOUT SIMULATOR]\n\n` +
    `Merchant: Aaryaraksha Disaster Relief Fund\n` +
    `Incident: ${incidentTitle}\n` +
    `Amount: ₹${numAmount.toLocaleString('en-IN')}\n` +
    `Supported Payment Options: UPI (GooglePay/PhonePe), Cards, Netbanking\n\n` +
    `Click OK to authorize transaction in test mode.`
  );

  if (confirmPayment) {
    // Add transaction to transparent store ledger
    store.addDonation(numAmount, incidentTitle, user);

    // Launch celebratory confetti burst for relief donor
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore if confetti script is restricted
    }

    if (onSuccess) onSuccess(paymentId);
  }
}
