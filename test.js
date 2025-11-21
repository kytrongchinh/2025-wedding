const { MongoClient, ClientEncryption } = require("mongodb");
const fs = require("fs");

// Read local master key from file
const localMasterKey = fs.readFileSync("./local-key.txt");

// KMS provider setup with the local key
const kmsProviders = {
	local: {
		key: localMasterKey,
	},
};

// Namespace for the key vault collection
const keyVaultNamespace = "encryption.__keyVault";

async function createDataEncryptionKey() {
	const client = new MongoClient("mongodb://localhost:27017/testdb");
	console.log(client, "client");

	try {
		await client.connect();

		console.log(client, "client");

		const encryption = new ClientEncryption(client, {
			keyVaultNamespace: keyVaultNamespace,
			kmsProviders: kmsProviders,
		});

		// Create Data Encryption Key (DEK) using the local KMS provider
		const keyId = await encryption.createDataKey("local");
		console.log("Data Encryption Key created with ID:", keyId);
		return keyId;
	} finally {
		await client.close();
	}
}

createDataEncryptionKey().catch(console.log("sssssss"));

// const schemaMap = {
// 	"testdb.encryptedCollection": {
// 		bsonType: "object",
// 		properties: {
// 			ssn: {
// 				encrypt: {
// 					bsonType: "string",
// 					algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
// 				},
// 			},
// 			creditCard: {
// 				encrypt: {
// 					bsonType: "string",
// 					algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
// 				},
// 			},
// 		},
// 	},
// };

// async function run() {
// 	const client = new MongoClient("mongodb://localhost:27017", {
// 		autoEncryption: {
// 			keyVaultNamespace: keyVaultNamespace,
// 			kmsProviders: kmsProviders,
// 			schemaMap: schemaMap,
// 		},
// 	});

// 	try {
// 		await client.connect();

// 		const db = client.db("testdb");
// 		const collection = db.collection("encryptedCollection");

// 		// Insert a document with encrypted fields
// 		const result = await collection.insertOne({
// 			name: "John Doe",
// 			ssn: "123-45-6789", // This will be encrypted
// 			creditCard: "4111-1111-1111-1111", // This will be encrypted
// 		});

// 		console.log("Document inserted:", result);

// 		// Query the document by encrypted field (only deterministic encryption allows querying)
// 		const foundDoc = await collection.findOne({ ssn: "123-45-6789" });
// 		console.log("Found document:", foundDoc);
// 	} finally {
// 		await client.close();
// 	}
// }

// run().catch(console.error);
