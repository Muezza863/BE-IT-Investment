import { Consultant } from "../models/index.js";
import { s3Client } from "../services/b2Connect.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getImageUrl } from "../helpers/s3Helper.js";

const generateConsultantId = async () => {
  const consultants = await Consultant.find(
    { id: /^consultant-\d+$/ },
    { id: 1, _id: 0 }
  ).lean();

  const maxNumber = consultants.reduce((max, consultant) => {
    const match = consultant.id.match(/^consultant-(\d+)$/);
    if (!match) {
      return max;
    }

    return Math.max(max, Number(match[1]));
  }, 0);

  const nextNumber = String(maxNumber + 1).padStart(3, "0");
  return `consultant-${nextNumber}`;
};

const formatConsultantResponse = async (consultant) => {
  if (!consultant) return null;
  const consultantObj = consultant.toObject ? consultant.toObject() : consultant;
  consultantObj.photo = await getImageUrl(consultantObj.photo);
  return consultantObj;
};

const validateConsultantPayload = (payload, { isUpdate = false } = {}) => {
  const errors = [];
  const { id, nama, spesialisasi, whatsapp, email } = payload;

  if (!isUpdate || nama !== undefined) {
    if (typeof nama !== "string" || !nama.trim()) {
      errors.push("Field 'nama' wajib berupa string dan tidak boleh kosong.");
    }
  }

  if (!isUpdate || spesialisasi !== undefined) {
    const isValidSpesialisasi =
      Array.isArray(spesialisasi) &&
      spesialisasi.length > 0 &&
      spesialisasi.every((item) => typeof item === "string" && item.trim());

    if (!isValidSpesialisasi) {
      errors.push("Field 'spesialisasi' wajib berupa array string dan minimal berisi 1 item.");
    }
  }

  if (!isUpdate || whatsapp !== undefined) {
    if (typeof whatsapp !== "string" || !/^https:\/\/wa\.me\/\d+$/.test(whatsapp)) {
      errors.push("Field 'whatsapp' wajib berupa link wa.me yang valid, contoh: https://wa.me/6281234567890.");
    }
  }

  if (!isUpdate || email !== undefined) {
    if (typeof email !== "string" || !/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Field 'email' wajib berupa link mailto yang valid, contoh: mailto:user@email.com.");
    }
  }

  if (id !== undefined && (typeof id !== "string" || !id.trim())) {
    errors.push("Field 'id' harus berupa string jika dikirim.");
  }

  return errors;
};

const sanitizeConsultantPayload = async (payload, existingConsultant = null, { allowCustomId = true } = {}) => ({
  id:
    (allowCustomId ? payload.id?.trim() : null) ||
    existingConsultant?.id ||
    (await generateConsultantId()),
  nama: payload.nama?.trim() ?? existingConsultant?.nama,
  spesialisasi:
    payload.spesialisasi?.map((item) => item.trim()) ?? existingConsultant?.spesialisasi,
  whatsapp: payload.whatsapp?.trim() ?? existingConsultant?.whatsapp,
  email: payload.email?.trim() ?? existingConsultant?.email,
  photo: payload.photo?.trim() ?? existingConsultant?.photo,
});

const getConsultants = async (req, res, next) => {
  try {
    const consultants = await Consultant.find().sort({ createdAt: 1, nama: 1 });
    const formattedConsultants = await Promise.all(
      consultants.map((c) => formatConsultantResponse(c))
    );

    res.status(200).json({
      status: "success",
      message: "Consultant list successfully retrieved.",
      data: formattedConsultants,
    });
  } catch (error) {
    next(error);
  }
};

const getConsultantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const consultant = await Consultant.findOne({ id });

    if (!consultant) {
      return res.status(404).json({
        status: "error",
        message: "Consultant not found.",
      });
    }

    const formattedConsultant = await formatConsultantResponse(consultant);

    return res.status(200).json({
      status: "success",
      message: "Consultant detail successfully retrieved.",
      data: formattedConsultant,
    });
  } catch (error) {
    next(error);
  }
};

const createConsultant = async (req, res, next) => {
  try {
    const errors = validateConsultantPayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid consultant payload.",
        errors,
      });
    }

    const newConsultantPayload = await sanitizeConsultantPayload(req.body, null, {
      allowCustomId: false,
    });

    // Handle photo upload if present
    if (req.file) {
      const file = req.file;
      const fileName = `consultants/consultant-${newConsultantPayload.id}-${Date.now()}-${file.originalname}`;

      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.B2_KEY_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(uploadCommand);
      newConsultantPayload.photo = fileName;
    }

    const newConsultant = await Consultant.create(newConsultantPayload);
    const formattedConsultant = await formatConsultantResponse(newConsultant);

    return res.status(201).json({
      status: "success",
      message: "Consultant successfully created.",
      data: formattedConsultant,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "Consultant id already exists.",
      });
    }

    next(error);
  }
};

const updateConsultant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentConsultant = await Consultant.findOne({ id });

    if (!currentConsultant) {
      return res.status(404).json({
        status: "error",
        message: "Consultant not found.",
      });
    }

    const errors = validateConsultantPayload(req.body, { isUpdate: true });

    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid consultant payload.",
        errors,
      });
    }

    const updatedPayload = await sanitizeConsultantPayload(req.body, currentConsultant);

    // Handle photo upload if present
    if (req.file) {
      const file = req.file;
      const fileName = `consultants/consultant-${id}-${Date.now()}-${file.originalname}`;

      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.B2_KEY_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(uploadCommand);
      updatedPayload.photo = fileName;
    }

    const updatedConsultant = await Consultant.findOneAndUpdate(
      { id },
      updatedPayload,
      {
        new: true,
        runValidators: true,
      }
    );

    const formattedConsultant = await formatConsultantResponse(updatedConsultant);

    return res.status(200).json({
      status: "success",
      message: "Consultant successfully updated.",
      data: formattedConsultant,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "Consultant id already exists.",
      });
    }

    next(error);
  }
};

const deleteConsultant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedConsultant = await Consultant.findOneAndDelete({ id });

    if (!deletedConsultant) {
      return res.status(404).json({
        status: "error",
        message: "Consultant not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Consultant successfully deleted.",
      data: deletedConsultant,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getConsultants,
  getConsultantById,
  createConsultant,
  updateConsultant,
  deleteConsultant,
};
