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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
console.log('Loading function');
const aws_sdk_1 = require("aws-sdk");
const utils_1 = require("./src/utils");
const s3 = new aws_sdk_1.S3({ apiVersion: '2006-03-01', region: 'eu-west-2' });
const handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received event:', JSON.stringify(event, null, 2));
    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };
    try {
        yield new Promise((resolve) => setTimeout(resolve, 5000));
        const { Contents } = yield s3.listObjectsV2({ Bucket: bucket }).promise();
        const files = Contents === null || Contents === void 0 ? void 0 : Contents.map((content) => content.Key);
        if ((files === null || files === void 0 ? void 0 : files.includes(`customers_${key.split('_')[1]}`)) &&
            files.includes(`orders_${key.split('_')[1]}`) &&
            files.includes(`items_${key.split('_')[1]}`)) {
            const { customers, orders, items } = yield (0, utils_1.getDataFromS3)(bucket, key);
            const messages = (0, utils_1.calculateTotalAmountSpentByCustomer)(customers, orders, items);
            messages.forEach((message) => {
                (0, utils_1.sendSQSMessage)(message);
            });
        }
        else {
            console.log(`Some of the required CSV files are missing.`);
            // Handle missing files
        }
    }
    catch (err) {
        console.error(err);
    }
});
exports.handler = handler;
