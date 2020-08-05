const createProductEnv = env => {
  const result = { env, envText: `当前工程环境：${env}`, serverUrl: '/' };
  if (env === 'development') {
    result.serverUrl = '/';
  } else {
    console.log = console.warn = console.info = () => { };
    result.serverUrl = '/';
  }
  return result;
};

export default createProductEnv(process.env.NODE_ENV);
