import { sendChatbotRequest } from "../services/chatbotService.js";
import { Chat, Project } from "../models/index.js";

const chatWithBot = async (req, res, next) => {
  try {
    const { payload, message, history } = req.body;

    if (!payload && (!message || typeof message !== "string")) {
      return res.status(400).json({
        status: "error",
        message: "Kirim 'payload' atau minimal field 'message'.",
      });
    }

    const result = await sendChatbotRequest({
      payload,
      message,
      history,
    });

    return res.status(200).json({
      status: "success",
      message: "Chatbot response retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { chatWithBot };

const getProjectChatHistory = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    let chat = await Chat.findOne({ projectId });

    if (!chat) {
      chat = { history: [] };
    }

    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil riwayat obrolan proyek.",
      data: chat.history,
    });
  } catch (error) {
    next(error);
  }
};

const sendProjectChatMessage = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Kirim minimal field 'message'.",
      });
    }

    // Ambil data project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ status: "error", message: "Proyek tidak ditemukan." });
    }

    // Ambil atau buat chat history
    let chat = await Chat.findOne({ projectId });
    if (!chat) {
      chat = new Chat({ projectId, history: [] });
    }

    // Menyusun context bawaan agar AI mengerti project
    let historyForModel = chat.history.map((h) => ({
      role: h.role,
      content: h.content,
    }));

    if (historyForModel.length === 0) {
      // Injeksi konteks project sebelum pesan pertama
      const systemContext = `Anda adalah asisten konsultan IT (IT Investment Chatbot). Jawablah pertanyaan user mengenai proyek investasi IT berikut ini.
Nama Proyek: ${project.projectName}
Industri: ${project.industry}
Skala: ${project.scale}
Detail Plan: ${project.plan}
Status Kelayakan: ${project.status}

Bantulah merinci atau memperdalam analisa di atas jika user bertanya. Tolong jawab dalam Bahasa Indonesia yang ramah dan profesional.`;
      
      historyForModel.push({ role: "user", content: systemContext });
      historyForModel.push({ role: "assistant", content: "Baik, saya mengerti. Ada yang bisa saya bantu tentang proyek ini?" });
    }

    // Kirim request ke bot
    const result = await sendChatbotRequest({
      message,
      history: historyForModel,
    });

    const aiMessage = result.text || "Mohon maaf, saya sedang mengalami gangguan.";

    // Simpan ke database
    chat.history.push({ role: "user", content: message });
    chat.history.push({ role: "assistant", content: aiMessage });
    await chat.save();

    return res.status(200).json({
      status: "success",
      message: "Chatbot response retrieved manually.",
      data: {
        text: aiMessage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getProjectChatHistory, sendProjectChatMessage };
