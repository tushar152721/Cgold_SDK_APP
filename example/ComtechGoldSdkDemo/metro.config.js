const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const libraryPath = path.resolve(__dirname, '../../library');

/**
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [libraryPath],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../library/node_modules'),
    ],
    extraNodeModules: {
      '@comtechgold/react-native-sdk': libraryPath,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
