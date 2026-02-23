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
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('threviaUsers') || '[]');
      const userExists = existingUsers.some((u) => u.email === formData.email);

      if (userExists) {
        setError('Email already registered');
        setLoading(false);
        return;
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: btoa(formData.password), // Basic encoding (NOT secure for production)
        createdAt: new Date().toISOString(),
        bucks: 0,
        engagementScore: 0,
        sessionsCompleted: 0,
        lastActive: new Date().toISOString(),
      };

      // Save to localStorage
      existingUsers.push(newUser);
      localStorage.setItem('threviaUsers', JSON.stringify(existingUsers));

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
      }, 1500);
    } catch (err) {
      setError(`Registration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.successTitle}>Registration Successful!</h2>
          <p style={styles.successText}>Welcome to Threvia, {formData.name}!</p>
          <p style={styles.successSubtext}>Redirecting to your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join Threvia today</p>
        </div>

        <form onSubmit={handleRegister} style={styles.form}>
          {/* Name Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={styles.input}
            />
          </div>

          {/* Email Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>

          {/* Phone Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+27 123 456 7890"
              style={styles.input}
            />
          </div>

          {/* Password Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              style={styles.input}
            />
          </div>

          {/* Confirm Password Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              style={styles.input}
            />
          </div>

          {/* Error Message */}
          {error && <div style={styles.error}>{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              style={styles.linkBtn}
            >
              Sign In
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
    gap: '18px',
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
  successCard: {
    background: 'rgba(10, 18, 32, 0.95)',
    border: '1px solid rgba(0, 245, 160, 0.3)',
    borderRadius: '20px',
    padding: '60px 30px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
  },
  successIcon: {
    fontSize: '48px',
    marginBottom: '20px',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#00f5a0',
    marginBottom: '12px',
  },
  successText: {
    fontSize: '16px',
    color: '#e8f0fe',
    marginBottom: '8px',
  },
  successSubtext: {
    fontSize: '12px',
    color: 'rgba(232, 240, 254, 0.5)',
  },
};
