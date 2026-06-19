import React, { useState, useEffect } from 'react';

export default function DashboardHome({ onSelectDocument }) {
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(true);

      useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        
        
       const docResponse = await fetch(`${API_URL}/api/docs`);

        let docData = [];

        if (docResponse.ok) {
          docData = await docResponse.json();
        } else {
          docData = [
            { id: "doc_kiran_training_2026", name: "Kiran Saini Summer Training Letter.pdf", type: "Letter" },
            { id: "doc_102", name: "Mutual Non-Disclosure Agreement.pdf", type: "Contract" },
            { id: "doc_103", name: "Commercial Office Rental Lease.pdf", type: "Agreement" }
          ];
        }

        // ✅ UPDATED: Fetch real-time status details for ALL document registry entries
        const enrichedDocs = await Promise.all(docData.map(async (doc) => {
          try {
        
            const statusRes = await fetch(`${API_URL}/api/status/${doc.id}`);


                        if (statusRes.ok) {
                            const statusData = await statusRes.json();
                            return { ...doc, status: statusData.status, reason: statusData.rejectionReason };
                        }
                    } catch (e) {
                        console.log("Database status catch triggered for id:", doc.id);
                    }

                    // Return default state if completely uninitialized in database
                    return { ...doc, status: 'Pending', reason: '' };
                }));


                setDocuments(enrichedDocs);
            } catch (err) {
                console.error("Dashboard calculation fault:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const totalCount = documents.length;
    const signedCount = documents.filter(d => d.status === 'Signed').length;
    const pendingCount = documents.filter(d => d.status === 'Pending').length;
    const rejectedCount = documents.filter(d => d.status === 'Rejected').length;

    const completionRate = totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 0;

    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeFilter === 'All' || doc.status === activeFilter;
        return matchesSearch && matchesTab;
    });

    const getStatusBadgeStyle = (status) => {
        switch (status) {
            case 'Signed': return { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
            case 'Rejected': return { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' };
            default: return { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' };
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#475569' }}>Loading Dashboard Panels...</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>📂 Document Management Console</h2>

            <div style={styles.analyticsSection}>
                <div style={styles.statsRow}>
                    <div style={{ ...styles.statCard, borderLeft: '5px solid #64748b' }}>
                        <span style={styles.statLabel}>Total Vault Files</span>
                        <span style={styles.statNumber}>{totalCount}</span>
                    </div>
                    <div style={{ ...styles.statCard, borderLeft: '5px solid #ffc107' }}>
                        <span style={styles.statLabel}>🟡 Pending Execution</span>
                        <span style={styles.statNumber}>{pendingCount}</span>
                    </div>
                    <div style={{ ...styles.statCard, borderLeft: '5px solid #28a745' }}>
                        <span style={styles.statLabel}>🟢 Signed & Closed</span>
                        <span style={styles.statNumber}>{signedCount}</span>
                    </div>
                    <div style={{ ...styles.statCard, borderLeft: '5px solid #dc3545' }}>
                        <span style={styles.statLabel}>🔴 Active Rejections</span>
                        <span style={styles.statNumber}>{rejectedCount}</span>
                    </div>
                </div>

                <div style={styles.progressContainer}>
                    <div style={styles.progressHeader}>
                        <span style={styles.progressLabel}>Transaction Completion Rate</span>
                        <span style={styles.progressPercent}>{completionRate}%</span>
                    </div>
                    <div style={styles.progressBarBackground}>
                        <div style={{ ...styles.progressBarFill, width: `${completionRate}%` }}></div>
                    </div>
                </div>
            </div>

            <div style={styles.controlRow}>
                <input
                    type="text"
                    placeholder="🔍 Search documents by file name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                />

                <div style={styles.tabNavbar}>
                    {['All', 'Pending', 'Signed', 'Rejected'].map((tab) => {
                        const count = tab === 'All' ? totalCount : tab === 'Pending' ? pendingCount : tab === 'Signed' ? signedCount : rejectedCount;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                style={{
                                    ...styles.tabButton,
                                    backgroundColor: activeFilter === tab ? '#007bff' : '#f8f9fa',
                                    color: activeFilter === tab ? '#fff' : '#495057',
                                    borderColor: activeFilter === tab ? '#007bff' : '#dee2e6'
                                }}
                            >
                                {tab} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={styles.gridContainer}>
                {filteredDocuments.length === 0 ? (
                    <div style={styles.emptyState}>No tracking records match current search criteria.</div>
                ) : (
                    filteredDocuments.map((doc) => (
                        <div key={doc.id} style={styles.documentCard}>
                            <div>
                                <div style={styles.cardHeader}>
                                    <span style={styles.fileIcon}>📄</span>
                                    <span style={{ ...styles.badge, ...getStatusBadgeStyle(doc.status) }}>{doc.status}</span>
                                </div>
                                <h4 style={styles.fileName}>{doc.name}</h4>
                                <p style={styles.fileMeta}>ID Tracking Signature: <code style={{ fontSize: '11px' }}>{doc.id}</code></p>
                                {doc.reason && <p style={styles.rejectionText}><strong>Reason Rejected:</strong> "{doc.reason}"</p>}
                            </div>

                            <button
                                onClick={() => onSelectDocument(doc)}
                                style={{
                                    ...styles.actionLaunchBtn,
                                    backgroundColor: doc.status === 'Signed' ? '#155724' : '#007bff',
                                    cursor: doc.status === 'Signed' ? 'not-allowed' : 'pointer'
                                }}
                                disabled={doc.status === 'Signed'}
                            >
                                {doc.status === 'Signed' ? '✓ Transaction Closed' : '🖋️ Open Signing Workspace'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { width: '100%', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' },
    title: { color: '#1e293b', marginBottom: '24px', fontWeight: 'bold' },
    analyticsSection: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' },
    statsRow: { display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', marginBottom: '24px' },
    statCard: { flex: '1', minWidth: '180px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' },
    statLabel: { fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
    statNumber: { fontSize: '24px', fontWeight: 'bold', color: '#0f172a' },
    progressContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
    progressHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    progressLabel: { fontSize: '14px', fontWeight: 'bold', color: '#334155' },
    progressPercent: { fontSize: '16px', fontWeight: 'bold', color: '#007bff' },
    progressBarBackground: { width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#007bff', borderRadius: '5px', transition: 'width 0.4s ease-in-out' },
    controlRow: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '30px' },
    searchInput: { flex: '1', minWidth: '280px', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' },
    tabNavbar: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    tabButton: { padding: '10px 16px', border: '1px solid', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s' },
    gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
    documentCard: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '240px' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
    fileIcon: { fontSize: '24px' },
    badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
    fileName: { fontSize: '15px', color: '#0f172a', margin: '0 0 6px 0', height: '44px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontWeight: '600' },
    fileMeta: { fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' },
    rejectionText: { fontSize: '11px', color: '#b91c1c', margin: '-6px 0 12px 0', backgroundColor: '#fef2f2', padding: '4px 8px', borderRadius: '4px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    actionLaunchBtn: { width: '100%', padding: '11px', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', transition: 'background 0.2s' },
    emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc' }
};