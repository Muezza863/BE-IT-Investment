import { sendChatbotRequest } from "../services/chatbotService.js";

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
