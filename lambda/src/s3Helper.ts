import { S3 } from 'aws-sdk';
import { recordTypes, ParsedData } from './dataModel';
import Papa from 'papaparse';
import { region } from '../config';

/**
 * Retrieves the content of an S3 object as a string.
 * @param s3 - S3 instance
 * @param bucket - S3 bucket name
 * @param key - S3 object key
 * @returns - Content of the S3 object as a string
 */
async function getObjectContent(
  s3: S3,
  bucket: string,
  key: string,
): Promise<string> {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    const data = await s3.getObject(params).promise();
    return data.Body!.toString();
  } catch (error) {
    console.log('Error retrieving S3 object:', error);
    throw error;
  }
}

/**
 * Fetches and parses CSV data from S3.
 * @param bucket - S3 bucket name
 * @param key - S3 object key
 * @returns - Parsed data as an object containing customers, orders, and items
 */
export async function fetchAndParseCsvDataFromS3(
  bucket: string,
  key: string,
): Promise<ParsedData> {
  console.log('Fetching .csv files from S3');
  try {
    const s3 = new S3({ apiVersion: '2006-03-01', region: region });

    const dataPromises = recordTypes.map(async ({ keyPrefix, fields }) => {
      const csvContent: string = await getObjectContent(
        s3,
        bucket,
        keyPrefix + key.split('_')[1],
      );
      return parseCsvData(csvContent, Object.values(fields));
    });

    const [customers, orders, items] = await Promise.all(dataPromises);

    return { customers, orders, items };
  } catch (error) {
    console.log('Error retrieving data from S3:', error);
    throw error;
  }
}

/**
 * Checks if all required files exist in the S3 bucket.
 * @param bucket - S3 bucket name
 * @param key - S3 object key
 * @returns - True if all required files exist, false otherwise
 */
export async function allRequiredFilesExist(
  bucket: string,
  key: string,
): Promise<boolean> {
  console.log('Checking if all required files exist');
  const s3 = new S3({ apiVersion: '2006-03-01', region: region });
  const customerKey = `customers_${key.split('_')[1]}`;
  const orderKey = `orders_${key.split('_')[1]}`;
  const itemKey = `items_${key.split('_')[1]}`;
  const { Contents } = await s3.listObjectsV2({ Bucket: bucket }).promise();
  const files = Contents?.map((content) => content.Key);
  if (
    !files?.includes(customerKey) ||
    !files.includes(orderKey) ||
    !files.includes(itemKey)
  ) {
    console.log(`Some of the required CSV files are missing.`);
    return false;
  }
  return true;
}

/**
 * Parses CSV data into an array of objects with specified fields.
 * @param csvContent - CSV content as a string
 * @param fields - Array of field names to include in the output objects
 * @returns - Array of objects containing the specified fields
 */
function parseCsvData(recordCsvContent: string, fields: string[]): any[] {
  return Papa.parse(recordCsvContent)
    .data.slice(1)
    .map((row: any) => {
      const record: any = {};
      fields.forEach((field, index) => {
        record[field] = row[index + 1];
        if (field === 'quantity') {
          record[field] = parseInt(record[field], 10);
        }
        if (field === 'total_price') {
          record[field] = parseFloat(record[field]);
        }
      });
      return record;
    });
}
