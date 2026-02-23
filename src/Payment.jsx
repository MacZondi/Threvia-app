import { useState } from 'react';
import { pay, getPaymentStatus } from '@base-org/account';
import { BasePayButton } from '@base-org/account-ui/react';

export function PaymentComponent() {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  // Your recipient wallet address (update with your address)
  const RECIPIENT_ADDRESS = '0xYourRecipientAddressHere';

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Process payment
      const payment = await pay({
        amount: '5.00',           // USD amount
        to: RECIPIENT_ADDRESS,    // recipient address
        testnet: false            // set to false for mainnet
      });
      
      console.log(`Payment sent! ID: ${payment.id}`);
      setPaymentStatus(`Payment sent! Transaction ID: ${payment.id}`);
      
      // Check payment status
      const { status } = await getPaymentStatus({ 
        id: payment.id,
        testnet: false 
      });
      
      if (status === 'completed') {
        setPaymentStatus(`✅ Payment confirmed!`);
        console.log('Payment confirmed!');
      }
    } catch (err) {
      setError(`Payment failed: ${err.message}`);
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>💳 Support Threvia</h2>
        <p style={styles.subtitle}>Help us provide free health resources to South African youth</p>
      </div>

      <div style={styles.content}>
        <div style={styles.paymentCard}>
          <div style={styles.amount}>$5.00 USDC</div>
          <p style={styles.description}>
            Your donation helps us provide anonymous, judgment-free health guidance to thousands of young South Africans.
          </p>

          <BasePayButton
            colorScheme="light"
            onClick={handlePayment}
            disabled={loading}
          />

          {paymentStatus && (
            <div style={styles.success}>
              {paymentStatus}
            </div>
          )}

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}
        </div>

        <div style={styles.benefits}>
          <h3 style={styles.benefitsTitle}>What your donation supports:</h3>
          <ul style={styles.list}>
            <li>🧠 Mental health support & counseling</li>
            <li>🌿 Sexual health education</li>
            <li>🎓 Skills & career development</li>
            <li>📍 Local health resource mapping</li>
            <li>📡 Free internet sessions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    background: 'linear-gradient(160deg,#06080f 0%,#0a1220 100%)',
    color: '#e8f0fe',
    minHeight: '100vh',
    fontFamily: "'Sora',sans-serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#00f5a0',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(232,240,254,0.6)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  paymentCard: {
    background: 'rgba(0,245,160,0.05)',
    border: '1px solid rgba(0,245,160,0.2)',
    borderRadius: '16px',
    padding: '24px',
  },
  amount: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#00f5a0',
    marginBottom: '12px',
    fontFamily: "'Space Mono',monospace",
  },
  description: {
    fontSize: '14px',
    color: 'rgba(232,240,254,0.7)',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  success: {
    marginTop: '16px',
    padding: '12px',
    background: 'rgba(0,245,160,0.1)',
    border: '1px solid rgba(0,245,160,0.3)',
    borderRadius: '8px',
    color: '#00f5a0',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    marginTop: '16px',
    padding: '12px',
    background: 'rgba(255,68,68,0.1)',
    border: '1px solid rgba(255,68,68,0.3)',
    borderRadius: '8px',
    color: '#ff4444',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
  },
  benefits: {
    background: 'rgba(255,255,255,0.035)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '20px',
  },
  benefitsTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '14px',
    color: '#fff',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
};
