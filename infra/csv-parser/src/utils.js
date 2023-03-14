"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataFromS3 = exports.sendSQSMessage = exports.calculateTotalAmountSpentByCustomer = void 0;
const aws_sdk_1 = require("aws-sdk");
const os_1 = require("os");
const papaparse_1 = __importDefault(require("papaparse"));
function calculateTotalAmountSpentByCustomer(customers, orders, items) {
    return customers.map((customer) => {
        const matchingOrders = orders.filter((order) => order.customer_reference === customer.customer_reference);
        let totalAmountSpent = 0;
        matchingOrders.forEach((order) => {
            const matchingItems = items.filter((item) => item.order_reference === order.order_reference);
            matchingItems.forEach((item) => {
                totalAmountSpent =
                    totalAmountSpent + parseFloat(item.total_price.toString());
            });
        });
        const message = {
            type: 'customer_message',
            customer_reference: customer.customer_reference,
            number_of_orders: matchingOrders.length,
            total_amount_spent: totalAmountSpent,
        };
        return message;
    });
}
exports.calculateTotalAmountSpentByCustomer = calculateTotalAmountSpentByCustomer;
function sendSQSMessage(message) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const sqs = new aws_sdk_1.SQS({ apiVersion: '2012-11-05', region: 'eu-west-2' });
        const queueUrl = (_a = process.env.SQS_QUEUE_URL) !== null && _a !== void 0 ? _a : 'https://sqs.eu-west-2.amazonaws.com/264231384781/output-queue';
        const params = {
            MessageBody: JSON.stringify(message),
            QueueUrl: queueUrl,
        };
        return sqs.sendMessage(params).promise();
    });
}
exports.sendSQSMessage = sendSQSMessage;
function getDataFromS3(bucket, key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const s3 = new aws_sdk_1.S3({ apiVersion: '2006-03-01', region: 'eu-west-2' });
            const recordTypes = [
                {
                    keyPrefix: 'customers_',
                    fields: ['first_name', 'last_name', 'customer_reference', 'status'],
                    type: 'customers',
                },
                {
                    keyPrefix: 'orders_',
                    fields: [
                        'customer_reference',
                        'order_status',
                        'order_reference',
                        'order_timestamp',
                    ],
                    type: 'orders',
                },
                {
                    keyPrefix: 'items_',
                    fields: ['order_reference', 'item_name', 'quantity', 'total_price'],
                    type: 'items',
                },
            ];
            const dataPromises = recordTypes.map(({ keyPrefix, fields }) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const recordData = yield s3
                    .getObject({ Bucket: bucket, Key: keyPrefix + key.split('_')[1] })
                    .promise();
                const recordCsvContent = ((_a = recordData.Body) !== null && _a !== void 0 ? _a : '').toString('utf-8');
                return papaparse_1.default.parse(recordCsvContent)
                    .data.slice(1)
                    .map((row) => {
                    const record = {
                        type: os_1.type,
                    };
                    fields.forEach((field, index) => {
                        record[field] = row[index + 1];
                        if (field === 'quantity')
                            record[field] = parseInt(record[field], 10);
                        if (field === 'total_price')
                            record[field] = parseFloat(record[field]);
                    });
                    return record;
                });
            }));
            const [customers, orders, items] = yield Promise.all(dataPromises);
            return { customers, orders, items };
        }
        catch (error) {
            console.log('Error retrieving data from S3:', error);
            throw error;
        }
    });
}
exports.getDataFromS3 = getDataFromS3;
