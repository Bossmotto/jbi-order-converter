import React, { useState } from 'react';
import JSZip from 'jszip';

export default function App() {
  const [xmlOutput, setXmlOutput] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.split('\n').slice(1).filter(Boolean);

    const token = '001Phg5mWA';
    const accountNumber = '3417';
    const shipToID = '107';

    const xmlDocs = rows.map((row) => {
      const [
        CustomerOrderNo, PONumber, RecipientName, Street1, Street2, City,
        State, Zip, Phone, EmailAddress, PartNumber, Qty, LocID,
        ShipDropship, Residential, DropshipBilling, CarrierID
      ] = row.split(',').map((s) => s.replace(/\r|\"/g, '').trim());

      return \`<?xml version="1.0" encoding="UTF-8"?>
<Order>
  <Token>\${token}</Token>
  <CustomerOrderNo>\${CustomerOrderNo}</CustomerOrderNo>
  <PONumber>\${PONumber}</PONumber>
  <AccountNumber>\${accountNumber}</AccountNumber>
  <ShipToID>\${shipToID}</ShipToID>
  <EmailAddress>\${EmailAddress}</EmailAddress>
  <ShipDropship>\${ShipDropship}</ShipDropship>
  <Residential>\${Residential}</Residential>
  <DropshipBilling>\${DropshipBilling}</DropshipBilling>
  <CarrierID>\${CarrierID}</CarrierID>
  <DeliveryAddress>
    <RecipientName>\${RecipientName}</RecipientName>
    <Street1>\${Street1}</Street1>
    <Street2>\${Street2}</Street2>
    <City>\${City}</City>
    <State>\${State}</State>
    <Zip>\${Zip}</Zip>
    <Phone>\${Phone}</Phone>
  </DeliveryAddress>
  <LineItems>
    <ItemID>
      <PartNumber>\${PartNumber}</PartNumber>
      <Qty>\${Qty}</Qty>
      <LocID>\${LocID}</LocID>
    </ItemID>
  </LineItems>
</Order>\`;
    });

    const zip = new JSZip();
    xmlDocs.forEach((xml, i) => {
      const orderNo = rows[i].split(',')[0].trim();
      zip.file(\`JBI-\${orderNo}-\${accountNumber}.xml\`, xml);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    setXmlOutput(url);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>JBI Order XML Converter</h2>
      <input type='file' accept='.csv' onChange={handleFileUpload} />
      {xmlOutput && (
        <a href={xmlOutput} download='jbi_orders.zip'>
          <button style={{ marginTop: '1rem' }}>Download XML ZIP</button>
        </a>
      )}
    </div>
  );
}
