const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 4. Mock @opentelemetry/api — uses dynamic import() incompatible with Hermes
config.resolver.extraNodeModules = {
  '@opentelemetry/api': path.resolve(projectRoot, 'src/mocks/opentelemetry-api.js'),
};

// 4. Disable Hermes bytecode compilation to avoid version mismatch with Expo Go
//    (Expo Go 54.0.2 uses a different Hermes build than react-native 0.81.5)
config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => url.replace('transform.bytecode=1', 'transform.bytecode=0'),
};

module.exports = config;
