import jsPDF from 'jspdf';

/**
 * Generates a PDF warranty certificate.
 * @param {object} warrantyData - The warranty data object.
 */
export const generateWarrantyPDF = (warrantyData) => {
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.text("Nilrust Warranty Certificate", 105, 20, null, null, 'center');

  // Customer and Vehicle Details
  doc.setFontSize(12);
  doc.text("Customer Details", 20, 40);
  doc.text(`Name: ${warrantyData.customer.name}`, 20, 50);
  doc.text(`Email: ${warrantyData.customer.email}`, 20, 60);
  doc.text(`Phone: ${warrantyData.customer.phone}`, 20, 70);
  doc.text(`Address: ${warrantyData.customer.address}`, 20, 80);
  
  doc.text("Vehicle Details", 110, 40);
  doc.text(`Make: ${warrantyData.vehicle.make}`, 110, 50);
  doc.text(`Model: ${warrantyData.vehicle.model}`, 110, 60);
  doc.text(`Year: ${warrantyData.vehicle.year}`, 110, 70);
  doc.text(`VIN: ${warrantyData.vehicle.vin}`, 110, 80);
  doc.text(`Registration: ${warrantyData.vehicle.registration}`, 110, 90);

  // Warranty Items
  let yPos = 110;
  warrantyData.items.forEach((item, index) => {
      if (yPos > 250) { // Check for page break
          doc.addPage();
          yPos = 20;
      }
      doc.setFontSize(14);
      doc.text(`Product ${index + 1}: ${item.type}`, 20, yPos);
      doc.setFontSize(10);
      doc.text(`Serial/Voucher: ${item.serial}`, 20, yPos + 10);
      doc.text("Conditions:", 20, yPos + 20);
      // The splitTextToSize function is great for handling long text blocks
      const splitConditions = doc.splitTextToSize(item.conditions || "N/A", 170);
      doc.text(splitConditions, 20, yPos + 30);
      // Adjust yPos based on the height of the conditions text block
      yPos += 30 + (splitConditions.length * 5);
  });
  
  // Footer
  doc.setFontSize(10);
  doc.text(`Warranty issued on: ${new Date(warrantyData.purchaseDate).toLocaleDateString()}`, 20, 285);
  doc.text(`Warranty ID: ${warrantyData.id}`, 20, 290);
  doc.text("Signed: __________________", 120, 285);

  // Save the PDF
  doc.save(`warranty-${warrantyData.id}.pdf`);
};