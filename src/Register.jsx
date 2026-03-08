import { useState } from 'react';

export function RegisterForm({ onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredName, setRegisteredName] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Invalid email address');
      return false;
    }

    if (!formData.phone.match(/^\+?[\d\s\-()]{10,}$/)) {
      setError('Invalid phone number');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const existingUsers = JSON.parse(localStorage.getItem('threviaUsers') || '[]');
      const userExists = existingUsers.some((u) => u.email === formData.email);

      if (userExists) {
        setError('Email already registered');
        setLoading(false);
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: btoa(formData.password),
        createdAt: new Date().toISOString(),
        bucks: 0,
        engagementScore: 0,
        sessionsCompleted: 0,
        lastActive: new Date().toISOString(),
      };

      existingUsers.push(newUser);
      localStorage.setItem('threviaUsers', JSON.stringify(existingUsers));

      setRegisteredName(newUser.name);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        onRegisterSuccess(newUser);
      }, 1200);
    } catch (err) {
      setError(`Registration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>Ready</div>
          <h2 style={styles.successTitle}>Registration Successful</h2>
          <p style={styles.successText}>{registeredName}, your Threvia profile is now active.</p>
          <p style={styles.successSubtext}>Routing you into the sponsored onboarding flow.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.brandPanel}>
          <div style={styles.badge}>Secure onboarding</div>
          <h1 style={styles.heroTitle}>Create your account to start using Threvia services.</h1>
          <p style={styles.heroSub}>
            Registration is designed for reliable identity, privacy compliance, and smooth access
            to health, education, and opportunity modules.
          </p>

          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiValue}>POPIA</div>
              <div style={styles.kpiLabel}>privacy standard</div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiValue}>Unified</div>
              <div style={styles.kpiLabel}>account profile</div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiValue}>Fast</div>
              <div style={styles.kpiLabel}>signup flow</div>
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Create your Threvia account</h2>
            <p style={styles.subtitle}>Start with secure profile setup</p>
          </div>

          <form onSubmit={handleRegister} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+27 123 456 7890"
                style={styles.input}
              />
            </div>

            <div style={styles.rowFields}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  style={styles.input}
                />
              </div>
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account?{' '}
              <button onClick={onSwitchToLogin} style={styles.linkBtn}>
                Sign in
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
    boxShadow: '0 18px 44px rgba(0,0,0,0.44)',
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
    fontSize: 'clamp(27px, 4vw, 42px)',
    lineHeight: 1.1,
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
  rowFields: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '12px',
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
  successCard: {
    width: 'min(560px, 100%)',
    borderRadius: '24px',
    border: '1px solid rgba(131,164,222,0.24)',
    background: 'rgba(8,16,34,0.92)',
    boxShadow: '0 18px 44px rgba(0,0,0,0.44)',
    padding: '42px 28px',
    textAlign: 'center',
  },
  successIcon: {
    width: '78px',
    height: '78px',
    margin: '0 auto 16px',
    borderRadius: '22px',
    display: 'grid',
    placeItems: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: '14px',
    background: 'linear-gradient(180deg,#0d7ec7 0%,#0b6eaf 100%)',
  },
  successTitle: {
    margin: 0,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '32px',
    color: 'var(--th-ink)',
  },
  successText: {
    margin: '10px 0 6px',
    fontSize: '16px',
    color: 'var(--th-muted)',
  },
  successSubtext: {
    margin: 0,
    fontSize: '13px',
    color: 'var(--th-muted)',
  },
};
