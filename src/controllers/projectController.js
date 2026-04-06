// src/controllers/projectController.js
import { Project } from '../models/index.js'
import { generateProjectDraft } from '../services/index.js'

// Fungsi untuk mengelompokkan skala bisnis berdasarkan jumlah karyawan
const getBusinessScale = (employeeCount) => {
  const count = parseInt(employeeCount, 10);
  if (isNaN(count)) return 'Unknown';
  
  if (count <= 10) return 'Micro (1-10 employees)';
  if (count <= 50) return 'Small (11-50 employees)';
  if (count <= 250) return 'Medium (51-250 employees)';
  return 'Large (>250 employees)';
};

const createProject = async (req, res) => {
  try {
    // Menghilangkan projectName dan description dari input user
    // Menambahkan employeeCount untuk menentukan business scale
    const { industry, employeeCount, plan, location } = req.body;

    // 1. Validasi input dasar
    if (!industry || !employeeCount || !plan || !location) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'All fields (industry, employeeCount, plan, location) are required!' 
      });
    }

    // 2. Terjemahkan jumlah karyawan ke kelompok skala bisnis
    const scale = getBusinessScale(employeeCount);

    // 3. Simpan proyek awal ke Database (MongoDB) dengan status DRAFTING
    const defaultProjectName = `IT Project - ${industry}`;
    const defaultDescription = `IT solution implementation for ${scale} scale in ${location} area.`;

    const newProject = new Project({
<<<<<<< HEAD
      userId: req.user.id,
=======
<<<<<<< HEAD
      userId: req.user.id,
=======
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
      projectName: defaultProjectName,
      industry,
      scale,
      plan,
      location,
<<<<<<< HEAD
      status: 'DRAFTING',
=======
<<<<<<< HEAD
      status: 'DRAFTING',
=======
      status: 'DRAFTING', // Setup awal, menunggu proses AI
      // llmBaseDraft dibiarkan kosong
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
    });

    await newProject.save();

    // 4. Kirim respons HTTP ke frontend (tidak perlu menunggu AI)
    res.status(201).json({
      status: 'success',
      message: 'Project data successfully submitted. AI is currently drafting.',
      data: {
        projectId: newProject._id
      }
    });

    // 5. Jalankan Service LLM (Gemini) di background
    console.log(`[Project ${newProject._id}] Requesting estimate from Gemini in background...`);
    
    generateProjectDraft({ 
      projectName: defaultProjectName, 
      industry, 
      scale, 
      plan, 
      location, 
      description: defaultDescription 
    }).then(async (aiDraft) => {
      // 6. Jika AI berhasil me-return draft, update database
      newProject.llmBaseDraft = aiDraft;
      newProject.status = 'WAITING_USER_INPUT'; // Berubah status karena AI sudah selesai
      await newProject.save();
      console.log(`[Project ${newProject._id}] Background AI drafting finished successfully.`);
    }).catch(async (err) => {
      // Menangkap error jika proses background gagal, lalu update status menjadi ERROR
      console.error(`[Project ${newProject._id}] Error in background AI drafting:`, err);
      newProject.status = 'ERROR';
      try {
        await newProject.save();
      } catch (saveError) {
        console.error(`[Project ${newProject._id}] Failed to save ERROR status:`, saveError);
      }
    });

  } catch (error) {
    console.error('Error in createProject:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to create project.', 
      error: error.message 
    });
  }
};


// Fungsi untuk mendapatkan data hasil draf AI dari database
const getProjectDraft = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found.'
      });
    }

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
    if (project.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden - You are not allowed.'
      });
    }

<<<<<<< HEAD
=======
=======
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe
    res.status(200).json({
      status: 'success',
      message: 'Project draft successfully retrieved.',
      data: {
        projectId: project._id,
        status: project.status,
        expiresAt: project.expiresAt,
        calculatedScale: project.scale,
        draft: project.llmBaseDraft
      }
    });
  } catch (error) {
    console.error('Error in getProjectDraft:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to retrieve project draft.', 
      error: error.message 
    });
  }
};

// Fungsi untuk menghapus project, hanya berlaku jika statusnya 'ERROR'
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found.'
      });
    }

    if (project.status !== 'ERROR') {
      return res.status(403).json({
        status: 'error',
        message: 'Only projects with ERROR status can be deleted.'
      });
    }

    await Project.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Project successfully deleted.'
    });
  } catch (error) {
    console.error('Error in deleteProject:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to delete project.', 
      error: error.message 
    });
  }
};

// Fungsi untuk memformat tanggal menjadi 'Sat,20 Apr 2020'
const formatDateStr = (dateInput) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[d.getDay()];
  const day = d.getDate(); // Tidak dipadding 0 di depan untuk single digit, karena contoh Sat,20 -> 20. Jika ingin padding, tambah .toString().padStart(2, '0')
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${dayName},${day} ${month} ${year}`;
};

// Fungsi untuk mendapatkan daftar project
const getProjects = async (req, res) => {
  try {
<<<<<<< HEAD
    const projects = await Project.find({ userId: req.user.id }, '_id industry status createdAt').sort({ createdAt: -1 });
=======
<<<<<<< HEAD
    const projects = await Project.find({ userId: req.user.id }, '_id industry status createdAt').sort({ createdAt: -1 });
=======
    // Proyeksi (projection) field _id, industry, status, dan createdAt agar ringan
    // Diurutkan berdasarkan pembuatan terbaru ke terlama
    const projects = await Project.find({}, '_id industry status createdAt').sort({ createdAt: -1 });
>>>>>>> 9c295b348f703b385507ef93c9ef26cea24b4073
>>>>>>> aef6af45c6e9185c63419add24d927391a488abe

    const formattedProjects = projects.map(project => ({
      id: project._id,
      industry: project.industry,
      status: project.status,
      date: formatDateStr(project.createdAt) // Memformat tanggal sesuai contoh: Sat,20 Apr 2020
    }));

    res.status(200).json({
      status: 'success',
      message: 'Project list successfully retrieved.',
      data: formattedProjects
    });
  } catch (error) {
    console.error('Error in getProjects:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to retrieve project list.', 
      error: error.message 
    });
  }
};

// Fungsi untuk memperbarui (edit) data project atau draf LLM
const updateDraftProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
      new: true, // Mengembalikan dokumen setelah diupdate
      runValidators: true // Memastikan validasi model tetap berjalan
    });

    if (!updatedProject) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Project successfully updated.',
      data: updatedProject
    });
  } catch (error) {
    console.error('Error in updateProject:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update project.', 
      error: error.message 
    });
  }
};

export { 
  createProject, 
  getProjectDraft, 
  deleteProject, 
  getProjects, 
  updateDraftProject 
};