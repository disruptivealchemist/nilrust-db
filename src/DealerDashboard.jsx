import React from 'react';
import NewWarrantyForm from './NewWarrantyForm';

function DealerDashboard() {
  return (
    <div>
      <h2>Dealer Dashboard</h2>
      <p>Welcome, Dealer. Here you can submit new warranties, view the status of existing warranties, and manage your inventory.</p>
      
      <NewWarrantyForm />

      {/* Dealer-specific components and functionality will go here */}
    </div>
  );
}

export default DealerDashboard;
