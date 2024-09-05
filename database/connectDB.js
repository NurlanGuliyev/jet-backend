import 'colors';

import * as mongoose from 'mongoose';

const connectDB = async () => {
	try {
		if (process.env.MONGO_CONNECTION_STRING !== undefined) {
			const conn = await mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
				autoIndex: true,
			});

			console.log(`MongoDB Connected: ${conn.connection.host}`.green);
		}
	} catch (err) {
		console.error(`Error: ${err.message}`.red);

		process.exit(1);
	}
};

export default connectDB;
