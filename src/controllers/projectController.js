// src/controllers/projectController.js
import Project from '../models/Project.js'
import { generateProjectDraft } from '../services/llmService.js'

const createProject = async (req, res) => {
  try {
    const { projectName, industry, scale, plan, location, description } = req.body;

    // 1. Validasi input dasar
    if (!projectName || !industry || !scale || !plan || !location || !description) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Semua field (projectName, industry, scale, plan, location, description) wajib diisi!' 
      });
    }

    // 2. Panggil Service LLM (Gemini) untuk mendapatkan draft
    console.log('Meminta estimasi dari Gemini...');
    const aiDraft = await generateProjectDraft({ 
      projectName, industry, scale, plan, location, description 
    });

    // 3. Simpan ke Database (MongoDB)
    const newProject = new Project({
      projectName,
      industry,
      scale,
      plan,
      location,
      status: 'WAITING_USER_INPUT', // Berubah status karena AI sudah selesai
      llmBaseDraft: aiDraft,
      // simulationHistory masih kosong karena user belum melakukan kalkulasi
    });

    await newProject.save();

    // 4. Kirim respons ke frontend
    res.status(201).json({
      status: 'success',
      message: 'Proyek berhasil dibuat dan draf AI berhasil digenerate.',
      data: {
        projectId: newProject._id,
        status: newProject.status,
        expiresAt: newProject.expiresAt,
        draft: newProject.llmBaseDraft
      }
    });

  } catch (error) {
    console.error('Error di createProject:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Gagal membuat proyek.', 
      error: error.message 
    });
  }
};

export { createProject };