import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function WarrantyEditPage({ warrantyId, onBack }) {
  const [warranty, setWarranty] = useState(null);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [vehicle, setVehicle] = useState({ make: '', model: '', year: '', vin: '', registration: '' });
  const [warrantyItems, setWarrantyItems] = useState([]);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [signedWarrantyFile, setSignedWarrantyFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [productOptions, setProductOptions] = useState([]); // Stores {id, name} of products

  useEffect(() => {
    const fetchWarrantyAndProducts = async () => {
      setIsLoading(true);
      try {
        // Fetch products
        const productsQuery = query(collection(db, "products"), orderBy("name"));
        const productsSnapshot = await getDocs(productsQuery);
        const products = productsSnapshot.docs.map(doc => ({id: doc.id, name: doc.data().name}));
        setProductOptions(products);

        // Fetch warranty details
        const docRef = doc(db, 'warranties', warrantyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setWarranty(data);
          setCustomer(data.customer || { name: '', email: '', phone: '', address: '' });
          setVehicle(data.vehicle || { make: '', model: '', year: '', vin: '', registration: '' });
          setWarrantyItems(data.items || []);
          setPurchaseDate(data.purchaseDate || '');
        } else {
          setError("No such warranty found!");
        }
      } catch (err) {
        setError("Failed to fetch warranty data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWarrantyAndProducts();
  }, [warrantyId]);

  const handleItemChange = async (index, e) => {
    const { name, value } = e.target;
    const newItems = [...warrantyItems];
    newItems[index][name] = value;

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
  
  const handleFileChange = (e) => {
    setSignedWarrantyFile(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
        let signedWarrantyURL = warranty.signedWarrantyURL;
        if (signedWarrantyFile) {
            const fileRef = ref(storage, `signed_warranties/${signedWarrantyFile.name}-${Date.now()}`);
            const snapshot = await uploadBytes(fileRef, signedWarrantyFile);
            signedWarrantyURL = await getDownloadURL(snapshot.ref);
        }

        const updatedData = {
            customer,
            vehicle,
            items: warrantyItems,
            purchaseDate,
            signedWarrantyURL,
        };

        const warrantyRef = doc(db, 'warranties', warrantyId);
        await updateDoc(warrantyRef, updatedData);
        setSuccess('Warranty successfully updated!');

    } catch (err) {
        setError("Failed to update warranty.");
        console.error("Error updating document: ", err);
    } finally {
        setIsUpdating(false);
    }
  };

  if (isLoading) return <p>Loading warranty details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
        <button onClick={onBack} style={{ marginBottom: '20px' }}>&larr; Back to Dashboard</button>
        <h3>Edit Warranty: {warrantyId}</h3>
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <fieldset>
                <legend>Customer</legend>
                <input value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} />
                 <input value={customer.email} onChange={(e) => setCustomer({...customer, email: e.target.value})} />
            </fieldset>
            <fieldset>
                <legend>Vehicle</legend>
                <input value={vehicle.make} onChange={(e) => setVehicle({...vehicle, make: e.target.value})} />
                 <input value={vehicle.model} onChange={(e) => setVehicle({...vehicle, model: e.target.value})} />
            </fieldset>

            {warrantyItems.map((item, index) => (
                <div key={index}>
                    <select name="type" value={item.type} onChange={(e) => handleItemChange(index, e)}>
                         <option value="">-- Select Product --</option>
                        {productOptions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                    <input name="serial" value={item.serial} onChange={(e) => handleItemChange(index, e)} />
                    <textarea name="conditions" value={item.conditions} onChange={(e) => handleItemChange(index, e)} />
                </div>
            ))}


            <button type="submit" disabled={isUpdating}>{isUpdating ? 'Updating...' : 'Save Changes'}</button>
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </form>
    </div>
  );
}

export default WarrantyEditPage;
