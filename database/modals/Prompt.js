import mongoose from 'mongoose';

const PromptSchema = new mongoose.Schema({
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	updatedAt: {
		type: Date,
		default: null,
	},
	content: {
		type: String,
		default: '',
	},
});

export default mongoose.model('prompt', PromptSchema);
