
function crc16ccitt(payload: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePixPayload({
  key,
  name,
  city,
  amount,
  txid = '***'
}: {
  key: string;
  name: string;
  city: string;
  amount: number;
  txid?: string;
}) {
  const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const merchantName = normalize(name).substring(0, 25).toUpperCase();
  const merchantCity = normalize(city).substring(0, 15).toUpperCase();
  const amountStr = amount.toFixed(2);
  const cleanKey = key.replace(/[^a-zA-Z0-9@.+_-]/g, "");
  
  // Ensure txid is valid. If ***, keep it. Else clean it.
  // Pix TXID must be alphanumeric.
  const cleanTxid = txid === '***' ? '***' : txid.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25).toUpperCase();
  // If cleanTxid becomes empty after cleaning (and wasn't ***), fallback to ***
  const finalTxid = cleanTxid || '***';

  // Payload Format Indicator
  const payloadFormat = '000201';

  // Merchant Account Information
  // GUI (00) + Key (01)
  const gui = '0014br.gov.bcb.pix';
  const keyField = `01${cleanKey.length.toString().padStart(2, '0')}${cleanKey}`;
  const merchantAccountContent = gui + keyField;
  const merchantAccount = `26${merchantAccountContent.length.toString().padStart(2, '0')}${merchantAccountContent}`;

  // Merchant Category Code
  const merchantCategory = '52040000';

  // Transaction Currency
  const transactionCurrency = '5303986';

  // Transaction Amount
  const transactionAmount = `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;

  // Country Code
  const countryCode = '5802BR';

  // Merchant Name
  const merchantNameField = `59${merchantName.length.toString().padStart(2, '0')}${merchantName}`;

  // Merchant City
  const merchantCityField = `60${merchantCity.length.toString().padStart(2, '0')}${merchantCity}`;

  // Additional Data Field Template
  const txidField = `05${finalTxid.length.toString().padStart(2, '0')}${finalTxid}`;
  const additionalData = `62${txidField.length.toString().padStart(2, '0')}${txidField}`;

  // Build Payload without CRC
  const payload =
    payloadFormat +
    merchantAccount +
    merchantCategory +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantNameField +
    merchantCityField +
    additionalData +
    '6304';

  // Calculate CRC16
  const crc = crc16ccitt(payload);

  return payload + crc;
}
