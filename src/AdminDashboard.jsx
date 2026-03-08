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
          prize: '5000 Threvia Bucks + R1000',
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
          <h1 style={styles.title}>Threvia Control Center</h1>
          <p style={styles.subtitle}>
            Operational visibility into users, engagement, and competition loops
          </p>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'users', label: 'Users' },
          { id: 'leaderboard', label: 'Leaderboard' },
          { id: 'competitions', label: 'Competitions' },
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
                  Export Data
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
                        Delete
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
                        ? '1'
                        : index === 1
                          ? '2'
                          : index === 2
                            ? '3'
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
                              ? 'rgba(10,158,159,0.14)'
                              : 'rgba(191,84,63,0.14)',
                          color:
                            comp.status === 'active' ? '#0a9e9f' : '#b0523d',
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
    color: '#10223a',
    fontFamily: "'Manrope',sans-serif",
    padding: '24px clamp(14px, 4vw, 34px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '20px',
    padding: '18px clamp(14px, 4vw, 24px)',
    border: '1px solid rgba(16,34,58,0.12)',
    borderRadius: '20px',
    background:
      'linear-gradient(120deg,rgba(255,255,255,0.88) 0%,rgba(230,245,245,0.78) 45%,rgba(255,242,227,0.78) 100%)',
    boxShadow: '0 12px 30px rgba(16,34,58,0.12)',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 'clamp(30px, 4vw, 42px)',
    fontWeight: '700',
    margin: 0,
    color: '#0f2540',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(16,34,58,0.7)',
    margin: '8px 0 0',
    maxWidth: '760px',
    lineHeight: 1.45,
  },
  logoutBtn: {
    padding: '10px 16px',
    borderRadius: '12px',
    background: 'rgba(191,84,63,0.1)',
    border: '1px solid rgba(191,84,63,0.35)',
    color: '#b0523d',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '18px',
  },
  tab: {
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.75)',
    border: '1px solid rgba(16,34,58,0.12)',
    borderRadius: '999px',
    color: 'rgba(16,34,58,0.66)',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  tabActive: {
    color: '#0a9e9f',
    borderColor: 'rgba(10,158,159,0.45)',
    background: 'rgba(10,158,159,0.12)',
  },
  content: {
    marginBottom: '20px',
  },
  section: {
    background: 'rgba(255,255,255,0.84)',
    border: '1px solid rgba(16,34,58,0.12)',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 10px 24px rgba(16,34,58,0.1)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f2540',
    margin: 0,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  exportBtn: {
    padding: '10px 16px',
    borderRadius: '10px',
    background: 'linear-gradient(126deg,#0a9e9f 0%,#0d7ec7 68%,#f49a50 100%)',
    border: 'none',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px',
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
  },
  searchInput: {
    flex: '1 1 280px',
    padding: '11px 14px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.88)',
    border: '1px solid rgba(16,34,58,0.14)',
    color: '#10223a',
    fontSize: '13px',
    outline: 'none',
  },
  sortSelect: {
    padding: '11px 14px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.88)',
    border: '1px solid rgba(16,34,58,0.14)',
    color: '#10223a',
    fontSize: '13px',
  },
  table: {
    overflowX: 'auto',
    border: '1px solid rgba(16,34,58,0.1)',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.66)',
  },
  tableHeader: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    minWidth: '930px',
    background: 'rgba(10,158,159,0.12)',
    borderBottom: '1px solid rgba(16,34,58,0.1)',
    fontWeight: '700',
    fontSize: '12px',
    color: '#0a9e9f',
  },
  tableRow: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    minWidth: '930px',
    borderBottom: '1px solid rgba(16,34,58,0.08)',
    alignItems: 'center',
    fontSize: '13px',
    color: '#10223a',
  },
  bucksTag: {
    background: 'rgba(10,158,159,0.14)',
    color: '#0a9e9f',
    padding: '4px 8px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '11px',
  },
  scoreTag: {
    background: 'rgba(12,123,198,0.14)',
    color: '#0d7ec7',
    padding: '4px 8px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '11px',
  },
  deleteBtn: {
    background: 'rgba(191,84,63,0.1)',
    border: '1px solid rgba(191,84,63,0.28)',
    color: '#b0523d',
    padding: '6px 10px',
    borderRadius: '8px',
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
    background: 'rgba(255,255,255,0.72)',
    borderRadius: '12px',
    border: '1px solid rgba(16,34,58,0.12)',
  },
  rankBadge: {
    fontSize: '20px',
    minWidth: '40px',
    textAlign: 'center',
    color: '#0f2540',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontWeight: '700',
    fontSize: '14px',
    color: '#10223a',
  },
  leaderboardEmail: {
    fontSize: '12px',
    color: 'rgba(16,34,58,0.56)',
  },
  leaderboardScore: {
    textAlign: 'center',
    minWidth: '80px',
  },
  scoreValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0a9e9f',
  },
  scoreLabel: {
    fontSize: '10px',
    color: 'rgba(16,34,58,0.56)',
  },
  competitionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  competitionCard: {
    background: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(16,34,58,0.12)',
    borderRadius: '14px',
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
    color: '#10223a',
  },
  compStatus: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
  },
  compDesc: {
    fontSize: '13px',
    color: 'rgba(16,34,58,0.74)',
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
    color: 'rgba(16,34,58,0.56)',
    fontWeight: '600',
  },
  compValue: {
    color: '#0a9e9f',
    fontWeight: '600',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '16px',
    marginTop: '18px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.84)',
    border: '1px solid rgba(16,34,58,0.12)',
    borderRadius: '14px',
    padding: '18px',
    textAlign: 'center',
    boxShadow: '0 8px 20px rgba(16,34,58,0.08)',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#0a9e9f',
    marginBottom: '6px',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  statLabel: {
    fontSize: '12px',
    color: 'rgba(16,34,58,0.62)',
  },
};
