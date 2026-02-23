import { useState } from 'react';
import { createBaseAccountSDK } from '@base-org/account';
import { SignInWithBaseButton } from '@base-org/account-ui/react';

export function LoginForm({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);

  // Initialize Base Account SDK
  useState(() => {
    const sdk = createBaseAccountSDK({
      appName: 'Threvia Intelligence Engine',
    });
    setProvider(sdk.getProvider());
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem('threviaUsers') || '[]');
      
      // Find user by email
      const user = users.find((u) => u.email === email);

      if (!user) {
        setError('Email not found');
        setLoading(false);
        return;
      }

      // Check password
      const decodedPassword = atob(user.password);
      if (decodedPassword !== password) {
        setError('Invalid password');
        setLoading(false);
        return;
      }

      // Login successful
      const sessionUser = {
        ...user,
        loginMethod: 'email',
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem('threviaCurrentUser', JSON.stringify(sessionUser));
      onLoginSuccess(sessionUser);
    } catch (err) {
      setError(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBaseSignIn = async () => {
    if (!provider) {
      setError('Wallet provider not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nonce = window.crypto.randomUUID().replace(/-/g, '');

      // Switch to Base Chain
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }],
      });

      // Connect and authenticate
      const response = await provider.request({
        method: 'wallet_connect',
        params: [
          {
            version: '1',
            capabilities: {
              signInWithEthereum: {
                nonce,
                chainId: '0x2105',
              },
            },
          },
        ],
      });

      const { accounts } = response;
      const { address } = accounts[0];
      const { message, signature } = accounts[0].capabilities.signInWithEthereum;

      // Check if wallet user exists
      const users = JSON.parse(localStorage.getItem('threviaUsers') || '[]');
      let user = users.find((u) => u.walletAddress === address);

      if (!user) {
        // Create new wallet user
        user = {
          id: Date.now().toString(),
          name: 'Base User',
          email: `wallet-${address.slice(0, 6)}@base.local`,
          walletAddress: address,
          createdAt: new Date().toISOString(),
          bucks: 0,
          engagementScore: 0,
          sessionsCompleted: 0,
          lastActive: new Date().toISOString(),
        };
        users.push(user);
        localStorage.setItem('threviaUsers', JSON.stringify(users));
      }

      const sessionUser = {
        ...user,
        loginMethod: 'base',
        walletAddress: address,
        message,
        signature,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem('threviaCurrentUser', JSON.stringify(sessionUser));
      onLoginSuccess(sessionUser);
    } catch (err) {
      setError(`Base sign in failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your Threvia account</p>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <span>OR</span>
        </div>

        {/* Base Sign In */}
        <div style={styles.baseSignInContainer}>
          <SignInWithBaseButton
            colorScheme="light"
            onClick={handleBaseSignIn}
            disabled={loading}
            style={{ width: '100%' }}
          />
          <p style={styles.baseSubtext}>
            Sign in securely with your Base wallet
          </p>
        </div>

        {/* Register Link */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              style={styles.linkBtn}
            >
              Register Now
            </button>
          </p>
        </div>
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
    background: 'rgba(10, 18, 32, 0.95)',
    border: '1px solid rgba(0, 245, 160, 0.15)',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'rgba(232, 240, 254, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '12px 14px',
    border: '1px solid rgba(0, 245, 160, 0.2)',
    borderRadius: '10px',
    background: 'rgba(0, 245, 160, 0.05)',
    color: '#e8f0fe',
    fontSize: '14px',
    fontFamily: "'Sora',sans-serif",
    outline: 'none',
    transition: 'all 0.2s',
  },
  error: {
    padding: '12px 14px',
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ff4444',
    fontSize: '13px',
    textAlign: 'center',
  },
  submitBtn: {
    padding: '14px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg,#00f5a0,#00d9f5)',
    border: 'none',
    color: '#06080f',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Sora',sans-serif",
    marginTop: '8px',
    transition: 'all 0.2s',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
    color: 'rgba(232, 240, 254, 0.3)',
    fontSize: '12px',
  },
  baseSignInContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '24px',
  },
  baseSubtext: {
    fontSize: '11px',
    color: 'rgba(232, 240, 254, 0.4)',
    textAlign: 'center',
    margin: 0,
  },
  footer: {
    textAlign: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '20px',
  },
  footerText: {
    fontSize: '13px',
    color: 'rgba(232, 240, 254, 0.6)',
    margin: 0,
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#00f5a0',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: "'Sora',sans-serif",
    textDecoration: 'underline',
    padding: 0,
  },
};
