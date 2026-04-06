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
    const { industry, employeeCount, plan, location } = req.body;

    if (!industry || !employeeCount || !plan || !location) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'All fields (industry, employeeCount, plan, location) are required!' 
      });
    }

    const scale = getBusinessScale(employeeCount);
    const defaultProjectName = `IT Project - ${industry}`;
    const defaultDescription = `IT solution implementation for ${scale} scale in ${location} area.`;

    const newProject = new Project({
      userId: req.user.id,
      projectName: defaultProjectName,
      industry,
      scale,
      plan,
      location,
      status: 'DRAFTING', // Setup awal, menunggu proses AI
    });

    await newProject.save();

    res.status(201).json({
      status: 'success',
      message: 'Project data successfully submitted. AI is currently drafting.',
      data: {
        projectId: newProject._id
      }
    });

    console.log(`[Project ${newProject._id}] Requesting estimate from Gemini in background...`);
    
    generateProjectDraft({ 
      projectName: defaultProjectName, 
      industry, 
      scale, 
      plan, 
      location, 
      description: defaultDescription 
    }).then(async (aiDraft) => {
      newProject.llmBaseDraft = aiDraft;
      newProject.status = 'WAITING_USER_INPUT';
      await newProject.save();
      console.log(`[Project ${newProject._id}] Background AI drafting finished successfully.`);
    }).catch(async (err) => {
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

    if (project.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden - You are not allowed.'
      });
    }

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

const formatDateStr = (dateInput) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[d.getDay()];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${dayName},${day} ${month} ${year}`;
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }, '_id industry status createdAt').sort({ createdAt: -1 });

    const formattedProjects = projects.map(project => ({
      id: project._id,
      industry: project.industry,
      status: project.status,
      date: formatDateStr(project.createdAt)
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

const updateDraftProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
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