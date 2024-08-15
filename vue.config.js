module.exports = {
  transpileDependencies: true,
  pages: {
    popup: {
      entry: 'src/components/popup/popup.js', // Separate entry point for the popup
      // template: 'public/popup.html',
      filename: 'popup.html',
    },
    manage: {
      entry: 'src/components/manage/manage.js', // Separate entry point for the popup
      // template: 'public/popup.html',
      filename: 'index.html',
    }
  },
};
