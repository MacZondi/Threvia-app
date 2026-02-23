import { useState, useEffect } from 'react';

export function AdminDashboard({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'competitions', 'leaderboard'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('engagementScore'); // 'name', 'email', 'createdAt', 'engagementScore'

  useEffect(() => {
    loadUsers();
    loadCompetitions();
  }, []);

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('threviaUsers') || '[]');
    setUsers(allUsers);
  };

  const loadCompetitions = () => {
    // Initialize sample competitions if not exists
    const existingCompetitions = JSON.parse(
      localStorage.getItem('threviaCompetitions') || '[]'
    );

    if (existingCompetitions.length === 0) {
      const newCompetitions = [
        {
          id: '1',
          name: 'February Health Champion',
          description: 'Most engaged user in February',
          prize: '5000 Threvia Bucks + $50 USDC',
          startDate: '2026-02-01',
          endDate: '2026-02-28',
          metric: 'engagementScore',
          status: 'active',
          topWinners: [],
        },
        {
          id: '2',
          name: 'Data Marathon',
          description: 'Buy the most data packages',
          prize: 'Unlimited data for 1 month',
          startDate: '2026-02-15',
          endDate: '2026-03-15',
          metric: 'dataPackagesPurchased',
          status: 'active',
          topWinners: [],
        },
      ];
      localStorage.setItem(
        'threviaCompetitions',
        JSON.stringify(newCompetitions)
      );
      setCompetitions(newCompetitions);
    } else {
      setCompetitions(existingCompetitions);
    }
  };

  const filteredUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'email') return a.email.localeCompare(b.email);
      if (sortBy === 'createdAt')
        return new Date(b.createdAt) - new Date(a.createdAt);
      return (b[sortBy] || 0) - (a[sortBy] || 0);
    });

  const leaderboard = [...users]
    .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
    .slice(0, 10);

  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter((u) => u.id !== userId);
      localStorage.setItem('threviaUsers', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }
  };

  const exportUserData = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `threvia-users-${new Date().toISOString()}.json`;
    link.click();
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>📊 Admin Dashboard</h1>
          <p style={styles.subtitle}>Manage users and competitions</p>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'users', label: '👥 Users', icon: '👥' },
          { id: 'leaderboard', label: '🏆 Leaderboard', icon: '🏆' },
          { id: 'competitions', label: '🎯 Competitions', icon: '🎯' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>All Users ({users.length})</h2>
                <button onClick={exportUserData} style={styles.exportBtn}>
                  📥 Export Data
                </button>
              </div>

              <div style={styles.controls}>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={styles.sortSelect}
                >
                  <option value="engagementScore">Sort by Engagement</option>
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="createdAt">Sort by Date Joined</option>
                </select>
              </div>

              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <div style={{ flex: 2 }}>Name</div>
                  <div style={{ flex: 2 }}>Email</div>
                  <div style={{ flex: 1 }}>Phone</div>
                  <div style={{ flex: 1 }}>Bucks</div>
                  <div style={{ flex: 1 }}>Score</div>
                  <div style={{ flex: 1 }}>Sessions</div>
                  <div style={{ flex: 1 }}>Actions</div>
                </div>

                {filteredUsers.map((user) => (
                  <div key={user.id} style={styles.tableRow}>
                    <div style={{ flex: 2 }}>{user.name}</div>
                    <div style={{ flex: 2, fontSize: '12px' }}>{user.email}</div>
                    <div style={{ flex: 1, fontSize: '12px' }}>{user.phone || '-'}</div>
                    <div style={{ flex: 1 }}>
                      <span style={styles.bucksTag}>{user.bucks || 0}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={styles.scoreTag}>
                        {user.engagementScore || 0}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>{user.sessionsCompleted || 0}</div>
                    <div style={{ flex: 1 }}>
                      <button
                        onClick={() => deleteUser(user.id)}
                        style={styles.deleteBtn}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Top 10 Users by Engagement</h2>

              <div style={styles.leaderboard}>
                {leaderboard.map((user, index) => (
                  <div key={user.id} style={styles.leaderboardRow}>
                    <div style={styles.rankBadge}>
                      {index === 0
                        ? '🥇'
                        : index === 1
                          ? '🥈'
                          : index === 2
                            ? '🥉'
                            : `#${index + 1}`}
                    </div>
                    <div style={styles.leaderboardInfo}>
                      <div style={styles.leaderboardName}>{user.name}</div>
                      <div style={styles.leaderboardEmail}>{user.email}</div>
                    </div>
                    <div style={styles.leaderboardScore}>
                      <div style={styles.scoreValue}>
                        {user.engagementScore || 0}
                      </div>
                      <div style={styles.scoreLabel}>points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Competitions Tab */}
        {activeTab === 'competitions' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Active Competitions</h2>

              <div style={styles.competitionsGrid}>
                {competitions.map((comp) => (
                  <div key={comp.id} style={styles.competitionCard}>
                    <div style={styles.compHeader}>
                      <h3 style={styles.compTitle}>{comp.name}</h3>
                      <span
                        style={{
                          ...styles.compStatus,
                          background:
                            comp.status === 'active'
                              ? 'rgba(0,245,160,0.2)'
                              : 'rgba(255,68,68,0.2)',
                          color:
                            comp.status === 'active' ? '#00f5a0' : '#ff4444',
                        }}
                      >
                        {comp.status}
                      </span>
                    </div>

                    <p style={styles.compDesc}>{comp.description}</p>

                    <div style={styles.compDetails}>
                      <div style={styles.compDetail}>
                        <span style={styles.compLabel}>Prize:</span>
                        <span style={styles.compValue}>{comp.prize}</span>
                      </div>
                      <div style={styles.compDetail}>
                        <span style={styles.compLabel}>Period:</span>
                        <span style={styles.compValue}>
                          {new Date(comp.startDate).toLocaleDateString()} -{' '}
                          {new Date(comp.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{users.length}</div>
          <div style={styles.statLabel}>Total Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {users.reduce((sum, u) => sum + (u.bucks || 0), 0)}
          </div>
          <div style={styles.statLabel}>Total Bucks</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {users.reduce((sum, u) => sum + (u.sessionsCompleted || 0), 0)}
          </div>
          <div style={styles.statLabel}>Sessions Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{competitions.length}</div>
          <div style={styles.statLabel}>Active Competitions</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg,#06080f 0%,#0a1220 100%)',
    color: '#e8f0fe',
    fontFamily: "'Sora',sans-serif",
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#00f5a0',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(232,240,254,0.5)',
    margin: 0,
  },
  logoutBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    background: 'rgba(255,68,68,0.1)',
    border: '1px solid rgba(255,68,68,0.3)',
    color: '#ff4444',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Sora',sans-serif",
  },
  tabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '28px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  tab: {
    padding: '12px 20px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(232,240,254,0.5)',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#00f5a0',
    borderBottomColor: '#00f5a0',
  },
  content: {
    marginBottom: '32px',
  },
  section: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  exportBtn: {
    padding: '10px 16px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg,#00f5a0,#00d9f5)',
    border: 'none',
    color: '#06080f',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '12px',
  },
  controls: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  searchInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'rgba(0,245,160,0.08)',
    border: '1px solid rgba(0,245,160,0.2)',
    color: '#e8f0fe',
    fontSize: '13px',
    fontFamily: "'Sora',sans-serif",
    outline: 'none',
  },
  sortSelect: {
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'rgba(0,245,160,0.08)',
    border: '1px solid rgba(0,245,160,0.2)',
    color: '#e8f0fe',
    fontSize: '13px',
    fontFamily: "'Sora',sans-serif",
  },
  table: {
    overflowX: 'auto',
  },
  tableHeader: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    background: 'rgba(0,245,160,0.1)',
    borderRadius: '8px 8px 0 0',
    fontWeight: '700',
    fontSize: '12px',
    color: '#00f5a0',
  },
  tableRow: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    alignItems: 'center',
    fontSize: '13px',
  },
  bucksTag: {
    background: 'rgba(0,245,160,0.15)',
    color: '#00f5a0',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '11px',
  },
  scoreTag: {
    background: 'rgba(0,217,245,0.15)',
    color: '#00d9f5',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '11px',
  },
  deleteBtn: {
    background: 'rgba(255,68,68,0.1)',
    border: '1px solid rgba(255,68,68,0.2)',
    color: '#ff4444',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  leaderboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  leaderboardRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: 'rgba(0,245,160,0.08)',
    borderRadius: '12px',
    border: '1px solid rgba(0,245,160,0.15)',
  },
  rankBadge: {
    fontSize: '24px',
    minWidth: '40px',
    textAlign: 'center',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontWeight: '700',
    fontSize: '14px',
    color: '#e8f0fe',
  },
  leaderboardEmail: {
    fontSize: '12px',
    color: 'rgba(232,240,254,0.5)',
  },
  leaderboardScore: {
    textAlign: 'center',
    minWidth: '80px',
  },
  scoreValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#00f5a0',
  },
  scoreLabel: {
    fontSize: '10px',
    color: 'rgba(232,240,254,0.5)',
  },
  competitionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  competitionCard: {
    background: 'rgba(0,245,160,0.05)',
    border: '1px solid rgba(0,245,160,0.15)',
    borderRadius: '12px',
    padding: '20px',
  },
  compHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  compTitle: {
    fontSize: '16px',
    fontWeight: '700',
    margin: 0,
    flex: 1,
  },
  compStatus: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: '700',
  },
  compDesc: {
    fontSize: '12px',
    color: 'rgba(232,240,254,0.7)',
    margin: '8px 0 16px',
  },
  compDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  compDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
  },
  compLabel: {
    color: 'rgba(232,240,254,0.5)',
    fontWeight: '600',
  },
  compValue: {
    color: '#00f5a0',
    fontWeight: '600',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '32px',
  },
  statCard: {
    background: 'rgba(0,245,160,0.08)',
    border: '1px solid rgba(0,245,160,0.15)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#00f5a0',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '12px',
    color: 'rgba(232,240,254,0.5)',
  },
};
