module.exports = {
    webpackDevMiddleware: config => {
        config.watchOptions.poll = 300;
        return config;
    }
};
// when prject starts nextjs will loads automatically this file and read the code and poll files every 300ms