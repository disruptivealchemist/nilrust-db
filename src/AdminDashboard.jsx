import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import NewWarrantyForm from './NewWarrantyForm';
import WarrantyEditPage from './WarrantyEditPage';
import ResourcesPage from './ResourcesPage';
import UsersPage from './UsersPage';
import ProductsPage from './ProductsPage';
import WarrantyContentPage from './WarrantyContentPage'; // Import the new Warranty Content page
import { generateWarrantyPDF } from './utils/pdfGenerator';

function AdminDashboard() {
  const [warranties, setWarranties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingWarrantyId, setEditingWarrantyId] = useState(null);
  const [activeView, setActiveView] = useState('warranties'); // State for tabs

  useEffect(() => {
    if (activeView === 'warranties' && !editingWarrantyId) {
      const fetchWarranties = async () => {
        setIsLoading(true);
        try {
          const querySnapshot = await getDocs(collection(db, "warranties"));
          const warrantiesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setWarranties(warrantiesList);
        } catch (err) {
          setError("Failed to fetch warranties. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchWarranties();
    }
  }, [activeView, editingWarrantyId]);

  const handleReprint = (warranty) => generateWarrantyPDF(warranty);
  const handleViewEdit = (id) => setEditingWarrantyId(id);
  const handleBackToDashboard = () => setEditingWarrantyId(null);

  const renderWarrantiesView = () => (
    <div style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '40px' }}>
            <h3>Warranty Records</h3>
            {isLoading ? <p>Loading...</p> : error ? <p style={{color: 'red'}}>{error}</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    {/* Table Head and Body for Warranties */}
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Customer</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Vehicle</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Purchase Date</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {warranties.map(w => (
                            <tr key={w.id} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '8px' }}>{w.customer.name}</td>
                                <td style={{ padding: '8px' }}>{`${w.vehicle.year} ${w.vehicle.make} ${w.vehicle.model}`}</td>
                                <td style={{ padding: '8px' }}>{w.purchaseDate}</td>
                                <td style={{ padding: '8px' }}>
                                    <button onClick={() => handleViewEdit(w.id)} style={{ marginRight: '5px' }}>View/Edit</button>
                                    <button onClick={() => handleReprint(w)}>Reprint</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
        <NewWarrantyForm />
    </div>
  );

  const renderContent = () => {
    if (editingWarrantyId) {
      return <WarrantyEditPage warrantyId={editingWarrantyId} onBack={handleBackToDashboard} />;
    }

    switch (activeView) {
      case 'warranties': return renderWarrantiesView();
      case 'resources': return <ResourcesPage />;
      case 'users': return <UsersPage />;
      case 'products': return <ProductsPage />;
      case 'warranty_content': return <WarrantyContentPage />;
      default: return renderWarrantiesView();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
        <nav style={{ borderBottom: '2px solid #333', paddingBottom: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveView('warranties')} disabled={activeView === 'warranties'}>Warranties</button>
            <button onClick={() => setActiveView('resources')} disabled={activeView === 'resources'}>Resources</button>
            <button onClick={() => setActiveView('users')} disabled={activeView === 'users'}>Users</button>
            <button onClick={() => setActiveView('products')} disabled={activeView === 'products'}>Products</button>
            <button onClick={() => setActiveView('warranty_content')} disabled={activeView === 'warranty_content'}>Warranty Content</button>
        </nav>
        {renderContent()}
    </div>
  );
}

export default AdminDashboard;
