import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase';
import { collection, addDoc, serverTimestamp, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { generateWarrantyPDF } from './utils/pdfGenerator';

function NewWarrantyForm() {
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [vehicle, setVehicle] = useState({ make: '', model: '', year: '', vin: '', registration: '' });
  const [warrantyItems, setWarrantyItems] = useState([{ type: '', serial: '', conditions: '' }]);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [signedWarranty, setSignedWarranty] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productOptions, setProductOptions] = useState([]); // Stores {id, name} of products

  // Fetch product types from Firestore on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      const productsQuery = query(collection(db, "products"), orderBy("name"));
      const querySnapshot = await getDocs(productsQuery);
      const products = querySnapshot.docs.map(doc => ({id: doc.id, name: doc.data().name}));
      setProductOptions(products);
    };
    fetchProducts();
  }, []);

  const handleCustomerChange = (e) => setCustomer({ ...customer, [e.target.name]: e.target.value });
  const handleVehicleChange = (e) => setVehicle({ ...vehicle, [e.target.name]: e.target.value });

  const handleItemChange = async (index, e) => {
    const { name, value } = e.target;
    const newItems = [...warrantyItems];
    newItems[index][name] = value;

    // If the product type is changed, fetch its default conditions
    if (name === "type" && value) {
      const selectedProduct = productOptions.find(p => p.name === value);
      if (selectedProduct) {
        const contentDocRef = doc(db, 'warranty_content', selectedProduct.id);
        const docSnap = await getDoc(contentDocRef);
        if (docSnap.exists()) {
          newItems[index].conditions = docSnap.data().conditions;
        }
      }
    }
    setWarrantyItems(newItems);
  };

  const addItem = () => setWarrantyItems([...warrantyItems, { type: '', serial: '', conditions: '' }]);
  const removeItem = (index) => setWarrantyItems(warrantyItems.filter((_, i) => i !== index));
  const handleFileChange = (e) => setSignedWarranty(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (warrantyItems.some(item => !item.type || !item.serial)) {
        setError('All warranty products must have a type and serial number.');
        setIsSubmitting(false);
        return;
    }

    try {
      let signedWarrantyURL = null;
      if (signedWarranty) {
        const fileRef = ref(storage, `signed_warranties/${signedWarranty.name}-${Date.now()}`);
        const snapshot = await uploadBytes(fileRef, signedWarranty);
        signedWarrantyURL = await getDownloadURL(snapshot.ref);
      }

      const warrantyData = {
        customer,
        vehicle,
        items: warrantyItems,
        purchaseDate,
        signedWarrantyURL,
        status: 'active',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'warranties'), warrantyData);
      
      generateWarrantyPDF({ ...warrantyData, id: docRef.id });

      setSuccess(`Successfully created warranty (ID: ${docRef.id})! PDF has been generated.`);
      // Clear form
      setCustomer({ name: '', email: '', phone: '', address: '' });
      setVehicle({ make: '', model: '', year: '', vin: '', registration: '' });
      setWarrantyItems([{ type: '', serial: '', conditions: '' }]);
      setPurchaseDate('');
      setSignedWarranty(null);
      if(document.getElementById('signed-warranty-input')) {
        document.getElementById('signed-warranty-input').value = null;
      }

    } catch (error) {
      setError('Failed to create warranty. Please try again.');
      console.error("Error processing warranty: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
      <h3>Create a New Warranty</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <fieldset style={{ border: '1px solid #ddd', padding: '10px' }}>
          <legend>Customer Details</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input name="name" value={customer.name} onChange={handleCustomerChange} placeholder="Full Name" required />
            <input name="email" type="email" value={customer.email} onChange={handleCustomerChange} placeholder="Email" required />
            <input name="phone" value={customer.phone} onChange={handleCustomerChange} placeholder="Phone" />
            <input name="address" value={customer.address} onChange={handleCustomerChange} placeholder="Address" />
          </div>
        </fieldset>

        <fieldset style={{ border: '1px solid #ddd', padding: '10px' }}>
          <legend>Vehicle Details</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <input name="make" value={vehicle.make} onChange={handleVehicleChange} placeholder="Make (e.g., Toyota)" required />
            <input name="model" value={vehicle.model} onChange={handleVehicleChange} placeholder="Model (e.g., Camry)" required />
            <input name="year" type="number" value={vehicle.year} onChange={handleVehicleChange} placeholder="Year" required />
            <input name="vin" value={vehicle.vin} onChange={handleVehicleChange} placeholder="VIN" required />
            <input name="registration" value={vehicle.registration} onChange={handleVehicleChange} placeholder="Registration" />
          </div>
        </fieldset>
        
        <fieldset style={{ border: '1px solid #ddd', padding: '10px' }}>
          <legend>Warranty Products</legend>
          {warrantyItems.map((item, index) => (
            <div key={index} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <select name="type" value={item.type} onChange={(e) => handleItemChange(index, e)} required style={{ flex: 1 }}>
                  <option value="">-- Select Product --</option>
                  {productOptions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                <input name="serial" value={item.serial} onChange={(e) => handleItemChange(index, e)} placeholder="Serial / Voucher #" required style={{ flex: 1 }} />
                {warrantyItems.length > 1 && (
                  <button type="button" onClick={() => removeItem(index)} style={{ flexShrink: 0 }}>Remove</button>
                )}
              </div>
              <textarea name="conditions" value={item.conditions} onChange={(e) => handleItemChange(index, e)} placeholder="Select a product to auto-fill conditions or enter manually..." style={{ width: '100%', minHeight: '80px' }} />
            </div>
          ))}
          <button type="button" onClick={addItem}>Add Product</button>
        </fieldset>
        
        <fieldset style={{ border: '1px solid #ddd', padding: '10px' }}>
            <legend>Signed Warranty (Optional)</legend>
            <p>Upload a scanned or signed copy of the warranty form.</p>
            <input id="signed-warranty-input" type="file" onChange={handleFileChange} />
        </fieldset>

        <div>
          <label>Purchase Date: </label>
          <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
        </div>

        <button type="submit" disabled={isSubmitting} style={{ marginTop: '10px', padding: '10px' }}>
          {isSubmitting ? 'Submitting...' : 'Submit Warranty & Generate PDF'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </form>
    </div>
  );
}

export default NewWarrantyForm;
