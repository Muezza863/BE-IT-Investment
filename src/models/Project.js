// src/models/Project.js
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  description: { type: String },
  nominal: { type: Number, default: 0 } // AI sekarang akan mengisi nilai ini dengan estimasi
}, { _id: false });

const componentsSchema = new mongoose.Schema({
  capex: [itemSchema],
  opex: [itemSchema],
  tangibleBenefits: [itemSchema],
  intangibleBenefits: [itemSchema]
}, { _id: false });

// Sub-schema untuk menyimpan riwayat simulasi
const simulationSchema = new mongoose.Schema({
  scenarioName: { type: String, default: "Simulasi" }, // cth: "Skenario Optimis", "Skenario Pesimis"
  simulatedData: componentsSchema,
  financialResults: {
    npv: Number,
    roi: Number,
    silkScore: Number,
    isFeasible: Boolean
  },
  calculatedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
<<<<<<< HEAD
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
=======
<<<<<<< HEAD
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
=======
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
  projectName: { type: String, required: true },
  industry: { type: String, required: true },
  scale: { type: String, required: true },
  plan: { type: String, required: true },
  location: { type: String, required: true },
  
  status: { 
    type: String, 
    enum: ['DRAFTING', 'WAITING_USER_INPUT', 'CALCULATED', 'ERROR'], 
    default: 'DRAFTING' 
  },
  
  // Batasan waktu 7 hari
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
  },

  // Snapshot murni dari AI (termasuk estimasi harganya)
  llmBaseDraft: componentsSchema,
  
  // Array untuk menyimpan berbagai percobaan kalkulasi user
  simulationHistory: [simulationSchema],

}, { timestamps: true });

// Middleware Mongoose untuk mengecek apakah proyek sudah expired
projectSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

export default mongoose.model('Project', projectSchema);