const fs = require('fs');
const path = require('path');

const flutterLibDir = path.join(__dirname, 'apps/flutter_mobile/lib');
const featuresDir = path.join(flutterLibDir, 'features');

if (fs.existsSync(featuresDir)) {
  const featureFolders = fs.readdirSync(featuresDir).filter(f => fs.statSync(path.join(featuresDir, f)).isDirectory());
  for (const feature of featureFolders) {
    const featurePath = path.join(featuresDir, feature);
    
    // Create domain layer
    const domainPath = path.join(featurePath, 'domain');
    if (!fs.existsSync(domainPath)) fs.mkdirSync(domainPath);
    
    const domainEntities = path.join(domainPath, 'entities');
    const domainUsecases = path.join(domainPath, 'usecases');
    const domainRepos = path.join(domainPath, 'repositories');
    
    if (!fs.existsSync(domainEntities)) fs.mkdirSync(domainEntities);
    if (!fs.existsSync(domainUsecases)) fs.mkdirSync(domainUsecases);
    if (!fs.existsSync(domainRepos)) fs.mkdirSync(domainRepos);
    
    // Ensure data layer exists with subfolders
    const dataPath = path.join(featurePath, 'data');
    if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);
    
    const dataModels = path.join(dataPath, 'models');
    const dataDatasources = path.join(dataPath, 'datasources');
    const dataRepos = path.join(dataPath, 'repositories');
    
    if (!fs.existsSync(dataModels)) fs.mkdirSync(dataModels);
    if (!fs.existsSync(dataDatasources)) fs.mkdirSync(dataDatasources);
    if (!fs.existsSync(dataRepos)) fs.mkdirSync(dataRepos);
  }
}

const coreDir = path.join(flutterLibDir, 'core');
if (!fs.existsSync(coreDir)) fs.mkdirSync(coreDir);
const coreConfig = path.join(coreDir, 'config');
const coreError = path.join(coreDir, 'error');
const coreNetwork = path.join(coreDir, 'network');
const coreRouter = path.join(coreDir, 'router');
const coreUtils = path.join(coreDir, 'utils');

if (!fs.existsSync(coreConfig)) fs.mkdirSync(coreConfig);
if (!fs.existsSync(coreError)) fs.mkdirSync(coreError);
if (!fs.existsSync(coreNetwork)) fs.mkdirSync(coreNetwork);
if (!fs.existsSync(coreRouter)) fs.mkdirSync(coreRouter);
if (!fs.existsSync(coreUtils)) fs.mkdirSync(coreUtils);

console.log('Flutter restructuring folders created.');
