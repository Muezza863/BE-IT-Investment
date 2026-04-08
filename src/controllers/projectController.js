import { Project, Quadrant } from '../models/index.js'
import { generateProjectDraft, determineMcFarlanQuadrant, calculateProjectValue } from '../services/index.js'
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
    const { 
      projectName, industry, employeeCount, plan, location,
      businessDomain, technologyDomain, currentIT, futureIT, DM, RE 
    } = req.body;

    // 1. Validasi input dasar (Level 1)
    if (
      !industry || employeeCount === undefined || !plan || !location ||
      !businessDomain || !technologyDomain || 
      currentIT === undefined || futureIT === undefined || 
      DM === undefined || RE === undefined
    ) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'All base fields (industry, employeeCount, plan, location, businessDomain, technologyDomain, currentIT, futureIT, DM, RE) are required!' 
      });
    }

    // Validasi pengecekan isi objek (Level 2)
    const { SM, CA, MI, CR, OR } = businessDomain;
    const { SA, DU, TU, IR } = technologyDomain;

    if (
      SM === undefined || CA === undefined || MI === undefined || CR === undefined || OR === undefined ||
      SA === undefined || DU === undefined || TU === undefined || IR === undefined
    ) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'All nested fields inside businessDomain (SM, CA, MI, CR, OR) and technologyDomain (SA, DU, TU, IR) are strictly required!' 
      });
    }

    const scale = getBusinessScale(employeeCount);

    // Hitung posisi McFarlan Strategic Grid berdasarkan skor kuesioner
    const mcfarlanResult = determineMcFarlanQuadrant(currentIT, futureIT, DM, RE);

    // 3. Simpan proyek awal ke Database (MongoDB) dengan status DRAFTING
    const finalProjectName = projectName || `IT Project - ${industry}`;
    const defaultDescription = `IT solution implementation for ${scale} scale in ${location} area.`;

    const newProject = new Project({
      userId: req.user.id,
      projectName: finalProjectName,
      industry,
      scale,
      plan,
      location,
      businessDomain: { SM, CA, MI, CR, OR },
      technologyDomain: { SA, DU, TU, IR },
      currentIT,
      futureIT,
      DM,
      RE,
      mcfarlan: mcfarlanResult,
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
      projectName: finalProjectName, 
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
        mcfarlan: project.mcfarlan,
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
      projectName: project.projectName,
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
    const { 
      capex = [], 
      opex = [], 
      tangibleBenefits = [], 
      intangibleBenefits = [], 
      inflationRate = 0.05, 
      taxRate = 0.11,
      discountRate = 0.1,
      years = 3, 
      scenarioName = "Simulasi" 
    } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found.'
      });
    }

    if (project.simulationHistory.length >= 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Maximum simulation limit (10 edits) has been reached. You can no longer edit this project.'
      });
    }


    // 1. Calculate base totals
    const initialCost = capex.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
    const baseOpex = opex.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
    const baseBenefit = tangibleBenefits.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0) +
                        intangibleBenefits.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);

    // 2. Prepare yearly arrays based on inflation constraints
    const yearlyBenefits = [];
    const yearlyCosts = [];

    for (let i = 1; i <= years; i++) {
        // Calculate inflation factor: (1 + inflationRate)^(i-1)
        const inflationFactor = Math.pow(1 + Number(inflationRate), i - 1);
        
        let currentGrossOpex = baseOpex * inflationFactor;
        let currentGrossBenefit = baseBenefit * inflationFactor;

        // Apply Tax on Net Benefit (if positive)
        let tax = 0;
        if (currentGrossBenefit > currentGrossOpex) {
            tax = (currentGrossBenefit - currentGrossOpex) * Number(taxRate);
        }

        // Net Benefit After Tax
        let netBenefit = currentGrossBenefit - tax;

        yearlyBenefits.push(netBenefit);
        yearlyCosts.push(currentGrossOpex);
    }

    // 3. Call Calculation Service
    const financialData = {
        initialCost,
        yearlyBenefits,
        yearlyCosts,
        discountRate: Number(discountRate)
    };

    const surveyScores = {
        businessDomain: project.businessDomain,
        technologyDomain: project.technologyDomain
    };

    const quadrantInfo = await Quadrant.findOne({ name: project.mcfarlan.quadrant });

    const calcResult = calculateProjectValue(financialData, surveyScores, quadrantInfo);

    if (!calcResult.success) {
         return res.status(400).json({ status: 'error', message: 'Failed to calculate financials' });
    }

    // 4. Overwrite base draft with new component sets
    const updatedComponents = { capex, opex, tangibleBenefits, intangibleBenefits };
    project.llmBaseDraft = updatedComponents;

    // 5. Update Status
    project.status = 'CALCULATED';

    // 6. Push to Simulation History
    const simulationEntry = {
        scenarioName,
        simulatedData: updatedComponents,
        simulationSettings: {
            inflationRate: Number(inflationRate),
            taxRate: Number(taxRate),
            discountRate: Number(discountRate),
            years: Number(years)
        },
        financialResults: {
            npv: calcResult.metrics.npv,
            roi: calcResult.metrics.roi,
            paybackPeriod: calcResult.metrics.paybackPeriod,
            breakEvenYear: calcResult.metrics.breakEvenYear,
            breakEvenAnalysisDetail: calcResult.breakEvenAnalysisDetail,
            ieScore: calcResult.metrics.ieScore,
            feasibilityStatus: calcResult.metrics.feasibilityStatus
        },
        calculatedAt: new Date()
    };

    project.simulationHistory.push(simulationEntry);

    // Simulation history is capped at 10 items via the return error above.

    await project.save();

    res.status(200).json({
      status: 'success',
      message: 'Project successfully calculated and updated.',
      data: project
    });
  } catch (error) {
    console.error('Error in updateDraftProject:', error);
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