const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try{
      const authHeader = req.get('Authorization');
      if (!authHeader) {
          return res.status(420).json('token required')
      }
      else{
          const token = authHeader.split(' ')[1];
          jwt.verify(token,process.env.ACCESS_TOKEN_KEY,async(err,decode)=>{
            try{
                if(decode)
                { 
                  req.psyId = decode.psychiatristId;
                 
                  next();
                }
             else if (err.message === "jwt expired")
                return res.status(403).json({message: "Access token expired"});
             else 
                    return res.status(402).json({message: "psychiatrist not authenticated" });
            }
            catch(err){
              err.statusCode=450;
              throw err;
            }
          })
        }
    }
    catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};