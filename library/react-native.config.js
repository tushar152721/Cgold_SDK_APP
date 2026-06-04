module.exports = {
  assets: ['./assets'],
  dependency: {
    platforms: {
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.comtechgold.sdk.ComtechGoldSdkPackage;',
        packageInstance: 'new ComtechGoldSdkPackage()',
      },
    },
  },
};
