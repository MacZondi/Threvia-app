import { useEffect, useState } from 'react';
import { createBaseAccountSDK } from '@base-org/account';
import { SignInWithBaseButton } from '@base-org/account-ui/react';

export function LoginForm({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
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
      const users = JSON.parse(localStorage.getItem('threviaUsers') || '[]');
      const user = users.find((u) => u.email === email);

      if (!user) {
        setError('Email not found');
        setLoading(false);
        return;
      }

      const decodedPassword = atob(user.password);
      if (decodedPassword !== password) {
        setError('Invalid password');
        setLoading(false);
        return;
      }

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

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }],
      });

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

      const users = JSON.parse(localStorage.getItem('threviaUsers') || '[]');
      let user = users.find((u) => u.walletAddress === address);

      if (!user) {
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
    <div style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.brandPanel}>
          <div style={styles.badge}>Trusted access platform</div>
          <h1 style={styles.heroTitle}>Threvia connects young people to verified digital care.</h1>
          <p style={styles.heroSub}>
            Secure onboarding, guided support modules, and sponsor-funded browsing sessions in one
            real-world platform.
          </p>

          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiValue}>25m</div>
              <div style={styles.kpiLabel}>session length</div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiValue}>10+</div>
              <div style={styles.kpiLabel}>care modules</div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiValue}>Secure</div>
              <div style={styles.kpiLabel}>identity and wallet</div>
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Sign in to Threvia</h2>
            <p style={styles.subtitle}>Continue your secure account session</p>
          </div>

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

          <div style={styles.divider}>
            <span>OR</span>
          </div>

          <div style={styles.baseSignInContainer}>
            <SignInWithBaseButton
              colorScheme="dark"
              onClick={handleBaseSignIn}
              disabled={loading}
              style={{ width: '100%' }}
            />
            <p style={styles.baseSubtext}>Use Base wallet for one-tap secure access</p>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Need an account?{' '}
              <button onClick={onSwitchToRegister} style={styles.linkBtn}>
                Register now
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px clamp(14px, 4vw, 34px)',
  },
  shell: {
    width: 'min(1100px, 100%)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '18px',
    alignItems: 'stretch',
  },
  brandPanel: {
    borderRadius: '24px',
    border: '1px solid rgba(131,164,222,0.24)',
    background: 'rgba(8,16,34,0.92)',
    padding: '26px clamp(18px, 4vw, 34px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 16px 40px rgba(16,34,58,0.14)',
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: '11px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#0a9e9f',
    border: '1px solid rgba(10,158,159,0.35)',
    background: 'rgba(10,158,159,0.1)',
    borderRadius: '999px',
    padding: '6px 11px',
    fontWeight: 700,
    marginBottom: '12px',
  },
  heroTitle: {
    margin: 0,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 'clamp(27px, 4vw, 44px)',
    lineHeight: 1.08,
    color: 'var(--th-ink)',
    marginBottom: '12px',
  },
  heroSub: {
    margin: 0,
    color: 'var(--th-muted)',
    fontSize: '15px',
    lineHeight: 1.55,
    marginBottom: '18px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px',
  },
  kpiCard: {
    border: '1px solid rgba(131,164,222,0.22)',
    background: 'rgba(8,16,34,0.72)',
    borderRadius: '14px',
    padding: '10px 12px',
  },
  kpiValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: '22px',
    color: 'var(--th-ink)',
  },
  kpiLabel: {
    fontSize: '11px',
    color: 'var(--th-muted)',
    textTransform: 'uppercase',
    letterSpacing: '.8px',
  },
  card: {
    borderRadius: '24px',
    border: '1px solid rgba(131,164,222,0.24)',
    background: 'rgba(8,16,34,0.9)',
    boxShadow: '0 18px 44px rgba(0,0,0,0.44)',
    padding: '30px clamp(18px, 4vw, 30px)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '30px',
    color: 'var(--th-ink)',
  },
  subtitle: {
    margin: '6px 0 0',
    fontSize: '14px',
    color: 'var(--th-muted)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    color: 'var(--th-muted)',
    textTransform: 'uppercase',
    letterSpacing: '.5px',
    fontWeight: 700,
  },
  input: {
    border: '1px solid rgba(131,164,222,0.24)',
    background: 'rgba(8,16,34,0.84)',
    borderRadius: '12px',
    padding: '11px 13px',
    color: 'var(--th-ink)',
    outline: 'none',
    fontSize: '14px',
  },
  error: {
    padding: '11px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(191,84,63,0.35)',
    background: 'rgba(191,84,63,0.12)',
    color: '#b0523d',
    fontSize: '13px',
  },
  submitBtn: {
    borderRadius: '12px',
    border: 'none',
    padding: '12px 14px',
    background: 'linear-gradient(180deg,#0d7ec7 0%,#0b6eaf 100%)',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(16,34,58,0.2)',
  },
  divider: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '8px 0 14px',
    color: 'rgba(214,228,255,0.46)',
    fontSize: '11px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  baseSignInContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  baseSubtext: {
    margin: 0,
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--th-muted)',
  },
  footer: {
    marginTop: '14px',
    paddingTop: '14px',
    borderTop: '1px solid rgba(131,164,222,0.24)',
    textAlign: 'center',
  },
  footerText: {
    margin: 0,
    fontSize: '13px',
    color: 'var(--th-muted)',
  },
  linkBtn: {
    border: 'none',
    background: 'transparent',
    color: '#0a9e9f',
    fontWeight: 700,
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: 0,
  },
};
