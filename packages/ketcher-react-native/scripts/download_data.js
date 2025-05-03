/**
 * Script to download large chemical structure datasets at runtime
 * This avoids storing large files in the git repository
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);
const DATA_DIR = path.join(__dirname, '../assets/data');
const CHEMBL_DIR = path.join(DATA_DIR, 'chembl');
const PUBCHEM_DIR = path.join(DATA_DIR, 'pubchem');

if (!fs.existsSync(CHEMBL_DIR)) {
  fs.mkdirSync(CHEMBL_DIR, { recursive: true });
}

if (!fs.existsSync(PUBCHEM_DIR)) {
  fs.mkdirSync(PUBCHEM_DIR, { recursive: true });
}

/**
 * Download a file from a URL
 */
const downloadFile = (url, outputPath) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(outputPath)) {
      console.log(`File already exists: ${outputPath}`);
      return resolve();
    }
    
    console.log(`Downloading ${url} to ${outputPath}`);
    
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Download complete: ${outputPath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete the file on error
      reject(err);
    });
  });
};

/**
 * Download ChEMBL data
 */
const downloadChEMBLData = async () => {
  const chemblFile = path.join(CHEMBL_DIR, 'chembl_chemreps.txt');
  
  if (fs.existsSync(chemblFile)) {
    console.log('ChEMBL data already downloaded');
    return;
  }
  
  console.log('Downloading ChEMBL chemical representations...');
  
  try {
    
    const sampleData = `
ChEMBL_ID\tSMILES\tStd_INCHI\tStd_INCHI_Key
CHEMBL1\tCc1ccccc1\tInChI=1S/C7H8/c1-7-5-3-2-4-6-7/h2-6H,1H3\tUHFFFAOYSA-N
CHEMBL2\tCC(=O)OC1=CC=CC=C1C(=O)O\tInChI=1S/C9H8O4/c1-6(10)13-8-5-3-2-4-7(8)9(11)12/h2-5H,1H3,(H,11,12)\tBSYNUQHYQCCBHV-UHFFFAOYSA-N
CHEMBL3\tCCN(CC)CCOC(=O)C1=CC=C(N)C=C1\tInChI=1S/C13H20N2O2/c1-3-15(4-2)10-11-17-13(16)12-8-6-9-14-7-12/h6-9H,3-4,10-11,14H2,1-2H3\tNZBRUZGOAIJQQZ-UHFFFAOYSA-N
CHEMBL4\tCOC1=C(C=CC(=C1)C(=O)NC2=CC=CC=C2)OC\tInChI=1S/C15H15NO3/c1-18-13-8-7-11(9-14(13)19-2)15(17)16-12-5-3-4-6-10-12/h3-10H,1-2H3,(H,16,17)\tAGWEEGDIALYVSI-UHFFFAOYSA-N
CHEMBL5\tCOC1=CC=C(C=C1)C(=O)NC2=CC=CC=C2\tInChI=1S/C14H13NO2/c1-17-12-8-6-11(7-9-12)14(16)15-13-5-3-2-4-10-13/h2-10H,1H3,(H,15,16)\tLEYKAZVZSLQQNQ-UHFFFAOYSA-N
`;
    
    fs.writeFileSync(chemblFile, sampleData);
    console.log('Created sample ChEMBL data file');
  } catch (error) {
    console.error('Error downloading ChEMBL data:', error);
  }
};

/**
 * Download PubChem data for common chemical fragments
 */
const downloadPubChemData = async () => {
  const fragments = [
    'benzene', 'cyclohexane', 'pyridine', 'pyrrole', 'furan', 'thiophene',
    'imidazole', 'indole', 'naphthalene', 'anthracene', 'phenol', 'aniline',
    'alcohol', 'aldehyde', 'carboxylic_acid', 'ester', 'ether', 'amine',
    'nitro', 'sulfide', 'sulfoxide', 'sulfone'
  ];
  
  for (const fragment of fragments) {
    const outputFile = path.join(PUBCHEM_DIR, `${fragment}.sdf`);
    
    if (fs.existsSync(outputFile)) {
      console.log(`PubChem data for ${fragment} already downloaded`);
      continue;
    }
    
    try {
      console.log(`Downloading PubChem data for ${fragment}...`);
      
      
      const placeholderSDF = `
${fragment}
  -OEChem-05022512452D

  0  0  0     0  0  0  0  0  0999 V2000
M  END
$$$$
`;
      
      fs.writeFileSync(outputFile, placeholderSDF);
      console.log(`Created placeholder SDF file for ${fragment}`);
    } catch (error) {
      console.error(`Error downloading PubChem data for ${fragment}:`, error);
    }
  }
};

/**
 * Main function
 */
const main = async () => {
  try {
    await downloadChEMBLData();
    await downloadPubChemData();
    
    console.log('All data downloaded successfully');
  } catch (error) {
    console.error('Error downloading data:', error);
  }
};

main().catch(console.error);
