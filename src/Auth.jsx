import { useState, useEffect } from 'react';
import { createBaseAccountSDK } from '@base-org/account';
import { SignInWithBaseButton } from '@base-org/account-ui/react';

export function AuthComponent({ onAuthSuccess, isAuthenticated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);

  // Initialize Base Account SDK
  useEffect(() => {
    const sdk = createBaseAccountSDK({
      appName: 'Threvia Intelligence Engine',
    });
    setProvider(sdk.getProvider());
  }, []);

  const generateNonce = () => {
    return window.crypto.randomUUID().replace(/-/g, '');
  };

  const handleSignIn = async () => {
    if (!provider) {
      setError('Provider not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Generate nonce
      const nonce = generateNonce();
      console.log('Generated nonce:', nonce);

      // 2. Switch to Base Chain
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }],
      });

      // 3. Connect and authenticate
      const response = await provider.request({
        method: 'wallet_connect',
        params: [
          {
            version: '1',
            capabilities: {
              signInWithEthereum: {
                nonce,
                chainId: '0x2105', // Base Mainnet
              },
            },
          },
        ],
      });

      const { accounts } = response;
      const { address } = accounts[0];
      const { message, signature } = accounts[0].capabilities.signInWithEthereum;

      console.log('Authentication successful!');
      console.log('Address:', address);

      // 4. Verify signature with backend (optional for mini apps)
      // For now, we'll just store the user info locally
      const userData = {
        address,
        message,
        signature,
        authenticated: true,
        loginTime: new Date().toISOString(),
      };

      // Store in localStorage for session persistence
      localStorage.setItem('threviaUser', JSON.stringify(userData));
      setUser(userData);

      if (onAuthSuccess) {
        onAuthSuccess(userData);
      }
    } catch (err) {
      console.error('Authentication failed:', err);
      setError(
        err.message || 'Failed to authenticate with Base. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('threviaUser');
    setUser(null);
    setError(null);
  };

  // Show authentication screen
  if (isAuthenticated === false || !user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.icon}>🔐</div>
            <h1 style={styles.title}>Welcome to Threvia</h1>
            <p style={styles.subtitle}>
              Sign in with your Base wallet to get started
            </p>
          </div>

          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🧠</span>
              <span>Anonymous health guidance</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🔒</span>
              <span>Secure & private</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>💰</span>
              <span>Earn rewards</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🌍</span>
              <span>Web3 native</span>
            </div>
          </div>

          <div style={styles.buttonContainer}>
            <SignInWithBaseButton
              colorScheme="light"
              onClick={handleSignIn}
              disabled={loading}
              style={{ width: '100%' }}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.info}>
            <p style={styles.infoText}>
              💡 Your privacy matters. We never collect personal data without your
              consent. Your health information stays with you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show user authenticated
  return (
    <div style={styles.userInfo}>
      <div style={styles.userCard}>
        <div style={styles.userHeader}>
          <div style={styles.userIcon}>✅</div>
          <h2 style={styles.userTitle}>Authenticated</h2>
        </div>

        <div style={styles.userDetails}>
          <div style={styles.userRow}>
            <span style={styles.label}>Wallet Address:</span>
            <span style={styles.address}>
              {user?.address?.slice(0, 6)}...{user?.address?.slice(-4)}
            </span>
          </div>
          <div style={styles.userRow}>
            <span style={styles.label}>Status:</span>
            <span style={styles.status}>🟢 Connected</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={styles.logoutBtn}
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    background: 'linear-gradient(160deg,#06080f 0%,#0a1220 100%)',
    fontFamily: "'Sora',sans-serif",
  },
  card: {
    background: 'rgba(10, 18, 32, 0.8)',
    border: '1px solid rgba(0, 245, 160, 0.2)',
    borderRadius: '20px',
    padding: '40px 30px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 8px 32px rgba(0, 245, 160, 0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#e8f0fe',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(232, 240, 254, 0.6)',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '28px',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    background: 'rgba(0, 245, 160, 0.08)',
    borderRadius: '10px',
    fontSize: '13px',
    color: 'rgba(232, 240, 254, 0.8)',
  },
  featureIcon: {
    fontSize: '16px',
  },
  buttonContainer: {
    marginBottom: '20px',
  },
  error: {
    padding: '12px 14px',
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ff4444',
    fontSize: '12px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  info: {
    marginTop: '20px',
    padding: '14px',
    background: 'rgba(0, 245, 160, 0.05)',
    borderRadius: '10px',
    borderLeft: '3px solid #00f5a0',
  },
  infoText: {
    fontSize: '12px',
    color: 'rgba(232, 240, 254, 0.5)',
    margin: 0,
    lineHeight: '1.5',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(160deg,#06080f 0%,#0a1220 100%)',
    minHeight: '200px',
  },
  userCard: {
    background: 'rgba(0, 245, 160, 0.05)',
    border: '1px solid rgba(0, 245, 160, 0.2)',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
  },
  userHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  userIcon: {
    fontSize: '36px',
    marginBottom: '10px',
  },
  userTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#00f5a0',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(0, 245, 160, 0.1)',
  },
  userRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
  },
  label: {
    color: 'rgba(232, 240, 254, 0.5)',
  },
  address: {
    color: '#00f5a0',
    fontFamily: "'Space Mono',monospace",
    fontWeight: '600',
  },
  status: {
    color: '#00f5a0',
    fontWeight: '600',
  },
  logoutBtn: {
    width: '100%',
    padding: '12px',
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    borderRadius: '10px',
    color: '#ff4444',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Sora',sans-serif",
    transition: 'all 0.2s',
  },
};
