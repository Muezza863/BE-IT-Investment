import ejs from 'ejs';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

// Mock Data yang sesuai dengan kebutuhan report.ejs
const mockData = {
    projectName: "DIGITAL TRANSFORMATION FOR RETAIL",
    industry: "Retail",
    scale: "Medium (51-250 employees)",
    plan: "Cloud ERP Implementation",
    location: "Jakarta, Indonesia",
    date: "10 April 2026",
    scenarioName: "Optimistic Scenario",
    
    businessDomain: {
        SM: 4.5,
        CA: 4.2,
        MI: 3.5,
        CR: 4.0,
        OR: 4.0
    },
    
    technologyDomain: {
        SA: 4.0,
        DU: 3.7,
        TU: 4.5,
        IR: 3.9
    },
    
    mcfarlan: {
        quadrant: "Strategic",
        coordinates: { x: 7.8, y: 8.5 }
    },
    
    financialResults: {
        npv: 45000000,
        roi: 0.225,
        paybackPeriod: 2.4,
        breakEvenYear: 3,
        ieScore: 78.5,
        feasibilityStatus: "Feasible",
        breakEvenAnalysisDetail: [
            { netCashFlow: -120000000, cumulativeCashFlow: -120000000 },
            { netCashFlow: 80000000, cumulativeCashFlow: -9500000 },
            { netCashFlow: 99000000, cumulativeCashFlow: 54000000 }
        ]
    },
    
    simulatedData: {
        capex: [
            { item: "Cloud Server Setup", description: "Initial server provisioning", nominal: 50000000 },
            { item: "Software Licensing", description: "ERP base licenses", nominal: 150000000 }
        ],
        opex: [
            { item: "Monthly Subscription", description: "SaaS fee per month", nominal: 10000000 },
            { item: "IT Support", description: "Ongoing maintenance", nominal: 5000000 }
        ],
        tangibleBenefits: [
            { item: "Efficiency Gains", nominal: 80000000 }
        ],
        intangibleBenefits: [
            { item: "Customer Satisfaction", nominal: 20000000 }
        ]
    },
    
    simulationSettings: {
        inflationRate: 0.05,
        taxRate: 0.11,
        discountRate: 0.1,
        years: 3
    },
    
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }
};

async function generateTestPdf() {
    console.log('--- Generating Test PDF ---');
    try {
        const templatePath = path.resolve('src/templates/pdf/report.ejs');
        console.log('Template path:', templatePath);
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found at ${templatePath}`);
        }

        console.log('Rendering HTML with EJS...');
        // EJS typically throws detailed errors including line numbers
        const html = await ejs.renderFile(templatePath, mockData, {
            // Add any EJS options if needed
        });

        console.log('HTML rendered successfully (Length: ' + html.length + ')');

        console.log('Launching Puppeteer...');
        const browser = await puppeteer.launch({ 
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: 'new' 
        });
        const page = await browser.newPage();
        
        console.log('Setting page content...');
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        console.log('Generating PDF buffer...');
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close();
        
        const outputPath = path.resolve('test-report.pdf');
        fs.writeFileSync(outputPath, pdfBuffer);
        
        console.log('✅ SUCCESS! PDF generated at:', outputPath);
    } catch (error) {
        console.error('❌ PDF GENERATION FAILED');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.stack) {
            console.error('Stack Trace:', error.stack);
        }
    }
}

generateTestPdf();
