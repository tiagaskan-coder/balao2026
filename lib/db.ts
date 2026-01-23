import fs from 'fs';
import path from 'path';
import { Product } from './utils';

const DB_PATH = path.join(process.cwd(), 'data', 'products.json');

export function getProducts(): Product[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
        // Return some default products if file doesn't exist
        return [];
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading products:", error);
    return [];
  }
}

export function saveProducts(products: Product[]) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2));
  } catch (error) {
      console.error("Error saving products:", error);
  }
}
