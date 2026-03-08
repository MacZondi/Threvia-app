import { useState } from 'react';
import { pay } from '@base-org/account';

export function DataPurchase({ userAddress, userBucks, onPurchaseComplete }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('zar'); // 'zar' or 'bucks'

  // Data packages available for purchase
  const packages = [
    {
      id: 'small',
      name: '500MB Data',
      dataSize: '500MB',
      zarPrice: 49,
      bucksPrice: 250,
      icon: '500',
      color: '#00f5a0',
      description: '500MB high-speed data valid for 30 days',
    },
    {
      id: 'medium',
      name: '2GB Data',
      dataSize: '2GB',
      zarPrice: 149,
      bucksPrice: 800,
      icon: '2GB',
      color: '#00bcd4',
      description: '2GB high-speed data valid for 30 days',
    },
    {
      id: 'large',
      name: '5GB Data',
      dataSize: '5GB',
      zarPrice: 329,
      bucksPrice: 1800,
      icon: '5GB',
      color: '#00d9f5',
      description: '5GB high-speed data valid for 60 days',
    },
    {
      id: 'premium',
      name: 'Unlimited Data',
      dataSize: 'Unlimited',
      zarPrice: 899,
      bucksPrice: 5000,
      icon: 'MAX',
      color: '#00f5a0',
      description: 'Unlimited data for 30 days - premium access',
    },
  ];

  const handleBucksPayment = async () => {
    if (!selectedPackage) return;

    const bucksCost = selectedPackage.bucksPrice;
    if (userBucks < bucksCost) {
      setError(`Insufficient Threvia Bucks. You need ${bucksCost} but have ${userBucks}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate token spending (in production, this would interact with smart contract)
      console.log(`Spending ${bucksCost} Threvia Bucks for ${selectedPackage.dataSize} data`);

      // Show success
      setSuccess(
        `Successfully purchased ${selectedPackage.dataSize}. Check notifications for activation details.`
      );

      // Notify parent component
      if (onPurchaseComplete) {
        onPurchaseComplete({
          package: selectedPackage,
          paymentMethod: 'bucks',
          bucksSpent: bucksCost,
        });
      }

      // Clear selection after 3 seconds
      setTimeout(() => {
        setSelectedPackage(null);
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(`Purchase failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleZARPayment = async () => {
    if (!selectedPackage) return;

    setLoading(true);
    setError(null);

    try {
      // Process payment with Base Pay
      const payment = await pay({
        amount: String(selectedPackage.zarPrice),
        to: '0xYourPaymentWalletAddress', // Replace with your wallet
        testnet: false, // Set to true for testnet
      });

      console.log(`Payment sent! Transaction ID: ${payment.id}`);

      setSuccess(
        `Payment received. Your ${selectedPackage.dataSize} data package is being activated.`
      );

      // Notify parent component
      if (onPurchaseComplete) {
        onPurchaseComplete({
          package: selectedPackage,
          paymentMethod: 'zar',
          transactionId: payment.id,
        });
      }

      // Clear selection after 3 seconds
      setTimeout(() => {
        setSelectedPackage(null);
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(`Payment failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Data Packages</h2>
        <p style={styles.subtitle}>Use Threvia Bucks or Rand to unlock high-speed data</p>
      </div>

      {/* Bucks Balance Display */}
      <div style={styles.balanceCard}>
        <div style={styles.balanceLeft}>
          <div style={styles.balanceIcon}>TB</div>
          <div>
            <div style={styles.balanceLabel}>Threvia Bucks</div>
            <div style={styles.balanceAmount}>{userBucks}</div>
          </div>
        </div>
        <div style={styles.balanceHint}>
          <span style={styles.hintText}>Earn more by engaging with health modules</span>
        </div>
      </div>

      {/* Packages Grid */}
      <div style={styles.packagesGrid}>
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg)}
            style={{
              ...styles.packageCard,
              ...(selectedPackage?.id === pkg.id ? styles.packageCardSelected : {}),
              borderColor: selectedPackage?.id === pkg.id ? pkg.color : 'rgba(16,34,58,0.12)',
              background:
                selectedPackage?.id === pkg.id ? `${pkg.color}15` : 'rgba(255,255,255,0.76)',
            }}
          >
            <div style={styles.packageIcon}>{pkg.icon}</div>
            <div style={styles.packageName}>{pkg.name}</div>
            <div style={styles.packageDesc}>{pkg.description}</div>

            <div style={styles.pricesRow}>
              <div style={styles.priceItem}>
                <div style={styles.priceLabel}>ZAR</div>
                <div style={styles.priceValue}>R {pkg.zarPrice}</div>
              </div>
              <div style={styles.priceItem}>
                <div style={styles.priceLabel}>BUCKS</div>
                <div style={styles.priceValue}>{pkg.bucksPrice}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Method Selector */}
      {selectedPackage && (
        <div style={styles.paymentSection}>
          <h3 style={styles.paymentTitle}>Choose Payment Method</h3>

          <div style={styles.methodRow}>
            <label style={styles.methodLabel}>
              <input
                type="radio"
                value="bucks"
                checked={paymentMethod === 'bucks'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={styles.radio}
              />
              <span>Threvia Bucks ({selectedPackage.bucksPrice})</span>
            </label>
            <span
              style={{
                ...styles.methodHint,
                color: userBucks >= selectedPackage.bucksPrice ? '#0a9e9f' : '#b0523d',
              }}
            >
              {userBucks >= selectedPackage.bucksPrice
                ? 'Sufficient balance'
                : 'Insufficient balance'}
            </span>
          </div>

          <div style={styles.methodRow}>
            <label style={styles.methodLabel}>
              <input
                type="radio"
                value="zar"
                checked={paymentMethod === 'zar'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={styles.radio}
              />
              <span>Rand (R {selectedPackage.zarPrice})</span>
            </label>
            <span style={styles.methodHint}>Secure checkout</span>
          </div>

          <div style={styles.buttonRow}>
            <button
              onClick={
                paymentMethod === 'bucks' ? handleBucksPayment : handleZARPayment
              }
              disabled={
                loading ||
                (paymentMethod === 'bucks' && userBucks < selectedPackage.bucksPrice)
              }
              style={{
                ...styles.purchaseBtn,
                opacity:
                  loading ||
                  (paymentMethod === 'bucks' &&
                    userBucks < selectedPackage.bucksPrice)
                    ? 0.6
                    : 1,
              }}
            >
              {loading
                ? 'Processing...'
                : paymentMethod === 'bucks'
                  ? `Buy with ${selectedPackage.bucksPrice} Bucks`
                  : `Buy for R ${selectedPackage.zarPrice}`}
            </button>
            <button
              onClick={() => {
                setSelectedPackage(null);
                setError(null);
                setSuccess(null);
              }}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '18px',
    color: '#10223a',
    fontFamily: "'Manrope',sans-serif",
    minHeight: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '30px',
    fontWeight: '700',
    margin: '0 0 8px',
    color: '#0f2540',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(16,34,58,0.66)',
    margin: 0,
  },
  balanceCard: {
    background:
      'linear-gradient(120deg,rgba(255,255,255,0.88) 0%,rgba(230,245,245,0.78) 55%,rgba(255,242,227,0.78) 100%)',
    border: '1px solid rgba(16,34,58,0.12)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  balanceLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  balanceIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    border: '1px solid rgba(16,34,58,0.14)',
    background: 'rgba(255,255,255,0.9)',
    display: 'grid',
    placeItems: 'center',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '.4px',
    color: '#10223a',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  balanceLabel: {
    fontSize: '12px',
    color: 'rgba(16,34,58,0.58)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  balanceAmount: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0a9e9f',
    fontFamily: "'Space Grotesk',sans-serif",
  },
  balanceHint: {
    fontSize: '12px',
    color: 'rgba(16,34,58,0.62)',
    textAlign: 'right',
    maxWidth: '140px',
  },
  hintText: {
    display: 'block',
    lineHeight: '1.4',
  },
  packagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  packageCard: {
    padding: '16px',
    borderRadius: '14px',
    border: '1.5px solid rgba(16,34,58,0.12)',
    background: 'rgba(255,255,255,0.76)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px',
  },
  packageCardSelected: {
    boxShadow: '0 10px 22px rgba(16,34,58,0.16)',
  },
  packageIcon: {
    marginBottom: '4px',
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    border: '1px solid rgba(16,34,58,0.14)',
    background: 'rgba(255,255,255,0.86)',
    display: 'grid',
    placeItems: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '.5px',
    color: '#0f2540',
  },
  packageName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#10223a',
  },
  packageDesc: {
    fontSize: '11px',
    color: 'rgba(16,34,58,0.56)',
    lineHeight: '1.3',
  },
  pricesRow: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    marginTop: '8px',
  },
  priceItem: {
    flex: 1,
    background: 'rgba(10,158,159,0.08)',
    borderRadius: '8px',
    padding: '6px',
  },
  priceLabel: {
    fontSize: '10px',
    color: 'rgba(16,34,58,0.55)',
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0a9e9f',
    fontFamily: "'Space Grotesk',sans-serif",
  },
  paymentSection: {
    background: 'rgba(255,255,255,0.84)',
    border: '1px solid rgba(16,34,58,0.12)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
  },
  paymentTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f2540',
    marginBottom: '16px',
  },
  methodRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(255,255,255,0.76)',
    borderRadius: '10px',
    marginBottom: '12px',
    border: '1px solid rgba(16,34,58,0.1)',
    gap: '12px',
  },
  methodLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    flex: 1,
  },
  radio: {
    cursor: 'pointer',
    width: '16px',
    height: '16px',
  },
  methodHint: {
    fontSize: '11px',
    color: 'rgba(16,34,58,0.58)',
    textAlign: 'right',
  },
  buttonRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '16px',
  },
  purchaseBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    background: 'linear-gradient(126deg,#0a9e9f 0%,#0d7ec7 68%,#f49a50 100%)',
    border: 'none',
    color: '#fff',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Manrope',sans-serif",
    transition: 'all 0.2s',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.76)',
    border: '1px solid rgba(16,34,58,0.14)',
    color: 'rgba(16,34,58,0.72)',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Manrope',sans-serif",
  },
  error: {
    marginTop: '12px',
    padding: '12px',
    background: 'rgba(191,84,63,0.1)',
    border: '1px solid rgba(191,84,63,0.32)',
    borderRadius: '8px',
    color: '#b0523d',
    fontSize: '13px',
    textAlign: 'center',
  },
  success: {
    marginTop: '12px',
    padding: '12px',
    background: 'rgba(10,158,159,0.1)',
    border: '1px solid rgba(10,158,159,0.3)',
    borderRadius: '8px',
    color: '#0a9e9f',
    fontSize: '13px',
    textAlign: 'center',
    fontWeight: '600',
  },
};
