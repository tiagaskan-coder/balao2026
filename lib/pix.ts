
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
  const merchantName = name.substring(0, 25).toUpperCase();
  const merchantCity = city.substring(0, 15).toUpperCase();
  const amountStr = amount.toFixed(2);

  // Payload Format Indicator
  const payloadFormat = '000201';

  // Merchant Account Information
  const merchantAccount = `26${(
    '0014br.gov.bcb.pix' +
    `01${key.length.toString().padStart(2, '0')}${key}`
  ).length.toString().padStart(2, '0')}0014br.gov.bcb.pix01${key.length.toString().padStart(2, '0')}${key}`;

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
  const additionalData = `62${(
    `05${txid.length.toString().padStart(2, '0')}${txid}`
  ).length.toString().padStart(2, '0')}05${txid.length.toString().padStart(2, '0')}${txid}`;

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
  const crc = crc16ccitt(payload).toUpperCase();

  return payload + crc;
}

function crc16ccitt(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
    }
  }

  return (crc & 0xffff).toString(16).padStart(4, '0');
}
