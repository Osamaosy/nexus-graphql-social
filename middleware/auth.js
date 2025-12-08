const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  
  // 1. لو مفيش هيدر، مش هنوقف الطلب، بس هنقول إنه مش موثق
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  const token = authHeader.split(' ')[1];
  let decodedToken;
  
  try {
    decodedToken = jwt.verify(token, 'somesupersecretsecret');
  } catch (err) {
    // 2. لو التوكن بايظ، برضه مش هنوقف، هنعتبره مش موثق
    req.isAuth = false;
    return next();
  }

  // 3. لو التوكن سليم بس مطلعش داتا
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }

  // 4. حالة النجاح: سجل البيانات وكمل
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};