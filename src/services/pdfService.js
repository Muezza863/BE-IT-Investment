import ejs from 'ejs';
import puppeteer from 'puppeteer';
import path from 'path';
import { s3Client } from './b2Connect.js';
import { PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Format number to IDR currency string
 * @param {number} amount 
 * @returns {string}
 */
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

/**
 * Generate PDF from EJS template and upload to Backblaze B2
 * @param {Object} project - Project model data
 * @param {Object} simulationEntry - The specific simulation entry to report
 * @returns {Promise<string>} - The public URL of the uploaded PDF
 */
export const generateAndUploadReport = async (project, simulationEntry) => {
    try {
        const templatePath = path.resolve('src/templates/pdf/report.ejs');
        
        // Prepare data for template
        const templateData = {
            // Page 1 – Executive Summary
            projectName: project.projectName || 'IT Project',
            industry: project.industry || '-',
            scale: project.scale || '-',
            plan: project.plan || '-',
            location: project.location || '-',
            date: new Date(simulationEntry.calculatedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            scenarioName: simulationEntry.scenarioName || 'Simulation',
            businessDomain: project.businessDomain || {},
            technologyDomain: project.technologyDomain || {},
            mcfarlan: project.mcfarlan || { quadrant: 'N/A', coordinates: { x: 5, y: 5 } },
            financialResults: simulationEntry.financialResults || {},

            // Page 2 – Financial Breakdown
            simulatedData: simulationEntry.simulatedData || {
                capex: [],
                opex: [],
                tangibleBenefits: [],
                intangibleBenefits: []
            },
            simulationSettings: simulationEntry.simulationSettings || {
                inflationRate: 0,
                taxRate: 0,
                discountRate: 0,
                years: 3
            },

            // Helper function passed to EJS
            formatCurrency
        };

        // 1. Render HTML with EJS
        const html = await ejs.renderFile(templatePath, templateData);

        // 2. Launch Puppeteer to generate PDF
        const browser = await puppeteer.launch({ 
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: 'new' 
        });
        const page = await browser.newPage();
        
        // Wait for fonts to load (Google Fonts in header)
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close();

        // 3. Upload to Backblaze B2
        const fileName = `reports/${project._id}/${Date.now()}-report.pdf`;
        
        const uploadParams = {
            Bucket: process.env.B2_BUCKET_NAME,
            Key: fileName,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // 4. Return the public URL
        const publicUrl = `${process.env.B2_ENDPOINT_PUBLIC}/${fileName}`;
        
        return publicUrl;
    } catch (error) {
        console.error('Error generating/uploading PDF:', error);
        throw new Error(`PDF Generation failed: ${error.message}`);
    }
};
