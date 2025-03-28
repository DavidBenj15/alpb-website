const authGuard = (req, res, next) => {
  console.log(req.session.user)
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized! Please log in.",
    });
  }
  next();
};

export default authGuard;
