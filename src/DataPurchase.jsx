import { useState, useEffect } from 'react';
import { pay } from '@base-org/account';

export function DataPurchase({ userAddress, userBucks, onPurchaseComplete }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('usdc'); // 'usdc' or 'bucks'

  // Data packages available for purchase
  const packages = [
    {
      id: 'small',
      name: '500MB Data',
      dataSize: '500MB',
      usdcPrice: '2.50',
      bucksPrice: 250,
      icon: '📱',
      color: '#00f5a0',
      description: '500MB high-speed data valid for 30 days',
    },
    {
      id: 'medium',
      name: '2GB Data',
      dataSize: '2GB',
      usdcPrice: '8.00',
      bucksPrice: 800,
      icon: '📲',
      color: '#00bcd4',
      description: '2GB high-speed data valid for 30 days',
    },
    {
      id: 'large',
      name: '5GB Data',
      dataSize: '5GB',
      usdcPrice: '18.00',
      bucksPrice: 1800,
      icon: '📡',
      color: '#00d9f5',
      description: '5GB high-speed data valid for 60 days',
    },
    {
      id: 'premium',
      name: 'Unlimited Data',
      dataSize: 'Unlimited',
      usdcPrice: '50.00',
      bucksPrice: 5000,
      icon: '🚀',
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
        `✅ Successfully purchased ${selectedPackage.dataSize}! Check your notifications for activation details.`
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

  const handleUSDCPayment = async () => {
    if (!selectedPackage) return;

    setLoading(true);
    setError(null);

    try {
      // Process USDC payment with Base Pay
      const payment = await pay({
        amount: selectedPackage.usdcPrice,
        to: '0xYourPaymentWalletAddress', // Replace with your wallet
        testnet: false, // Set to true for testnet
      });

      console.log(`Payment sent! Transaction ID: ${payment.id}`);

      setSuccess(
        `✅ Payment received! Your ${selectedPackage.dataSize} data package is being activated...`
      );

      // Notify parent component
      if (onPurchaseComplete) {
        onPurchaseComplete({
          package: selectedPackage,
          paymentMethod: 'usdc',
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
        <h2 style={styles.title}>🌐 Buy Data</h2>
        <p style={styles.subtitle}>Use Threvia Bucks or USDC to unlock high-speed data</p>
      </div>

      {/* Bucks Balance Display */}
      <div style={styles.balanceCard}>
        <div style={styles.balanceLeft}>
          <div style={styles.balanceIcon}>💰</div>
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
              borderColor: selectedPackage?.id === pkg.id ? pkg.color : 'rgba(255,255,255,0.1)',
              background:
                selectedPackage?.id === pkg.id ? `${pkg.color}15` : 'rgba(255,255,255,0.03)',
            }}
          >
            <div style={{ ...styles.packageIcon, fontSize: '32px' }}>{pkg.icon}</div>
            <div style={styles.packageName}>{pkg.name}</div>
            <div style={styles.packageDesc}>{pkg.description}</div>

            <div style={styles.pricesRow}>
              <div style={styles.priceItem}>
                <div style={styles.priceLabel}>USDC</div>
                <div style={styles.priceValue}>${pkg.usdcPrice}</div>
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
                color: userBucks >= selectedPackage.bucksPrice ? '#00f5a0' : '#ff4444',
              }}
            >
              {userBucks >= selectedPackage.bucksPrice
                ? '✅ Sufficient balance'
                : '❌ Insufficient balance'}
            </span>
          </div>

          <div style={styles.methodRow}>
            <label style={styles.methodLabel}>
              <input
                type="radio"
                value="usdc"
                checked={paymentMethod === 'usdc'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={styles.radio}
              />
              <span>USDC (${selectedPackage.usdcPrice})</span>
            </label>
            <span style={styles.methodHint}>One-tap payment</span>
          </div>

          <div style={styles.buttonRow}>
            <button
              onClick={
                paymentMethod === 'bucks' ? handleBucksPayment : handleUSDCPayment
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
                  : `Buy for $${selectedPackage.usdcPrice}`}
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
    padding: '20px',
    background: 'linear-gradient(160deg,#06080f 0%,#0a1220 100%)',
    color: '#e8f0fe',
    fontFamily: "'Sora',sans-serif",
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#00f5a0',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(232,240,254,0.6)',
  },
  balanceCard: {
    background: 'rgba(0,245,160,0.08)',
    border: '1px solid rgba(0,245,160,0.2)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  balanceIcon: {
    fontSize: '32px',
  },
  balanceLabel: {
    fontSize: '12px',
    color: 'rgba(232,240,254,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  balanceAmount: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#00f5a0',
    fontFamily: "'Space Mono',monospace",
  },
  balanceHint: {
    fontSize: '12px',
    color: 'rgba(232,240,254,0.4)',
    textAlign: 'right',
    maxWidth: '140px',
  },
  hintText: {
    display: 'block',
    lineHeight: '1.4',
  },
  packagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '28px',
  },
  packageCard: {
    padding: '16px',
    borderRadius: '14px',
    border: '1.5px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px',
  },
  packageCardSelected: {
    boxShadow: '0 0 24px rgba(0,245,160,0.2)',
  },
  packageIcon: {
    marginBottom: '4px',
  },
  packageName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#e8f0fe',
  },
  packageDesc: {
    fontSize: '11px',
    color: 'rgba(232,240,254,0.4)',
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
    background: 'rgba(0,245,160,0.1)',
    borderRadius: '8px',
    padding: '6px',
  },
  priceLabel: {
    fontSize: '10px',
    color: 'rgba(232,240,254,0.4)',
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#00f5a0',
    fontFamily: "'Space Mono',monospace",
  },
  paymentSection: {
    background: 'rgba(0,245,160,0.05)',
    border: '1px solid rgba(0,245,160,0.15)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
  },
  paymentTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '16px',
  },
  methodRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '10px',
    marginBottom: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
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
    color: 'rgba(232,240,254,0.5)',
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
    background: 'linear-gradient(135deg,#00f5a0,#00d9f5)',
    border: 'none',
    color: '#06080f',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Sora',sans-serif",
    transition: 'all 0.2s',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(232,240,254,0.6)',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Sora',sans-serif",
  },
  error: {
    marginTop: '12px',
    padding: '12px',
    background: 'rgba(255,68,68,0.1)',
    border: '1px solid rgba(255,68,68,0.3)',
    borderRadius: '8px',
    color: '#ff4444',
    fontSize: '13px',
    textAlign: 'center',
  },
  success: {
    marginTop: '12px',
    padding: '12px',
    background: 'rgba(0,245,160,0.1)',
    border: '1px solid rgba(0,245,160,0.3)',
    borderRadius: '8px',
    color: '#00f5a0',
    fontSize: '13px',
    textAlign: 'center',
    fontWeight: '600',
  },
};
