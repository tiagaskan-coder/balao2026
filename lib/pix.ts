
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

  // Point of Initiation Method (12 = Dynamic, 11 = Static)
  // Using 12 because we have a specific amount, but 11 is also valid.
  // However, for "Pix Key" based (no URL), 11 is safer.
  // If we omit, it defaults to 11? Better to be explicit if issues arise.
  // Actually, some banks prefer 010211.
  // But to be safest with "Key Not Found" errors, let's omit if not strictly required, 
  // OR try 11. 
  // Let's stick to standard structure. 
  // 000201 is mandatory.
  
  // Merchant Account Information
  // GUI (00) + Key (01)
  const gui = '0014br.gov.bcb.pix';
  // Force clean key to be just numbers if it looks like CNPJ/CPF (only digits provided in input)
  // But user input "34397947000108" is digits.
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
